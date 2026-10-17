import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/products";
import { checkoutSchema, normalizePkPhone } from "@/lib/validation";
import { checkRateLimit, generateOrderReferenceNo } from "@/lib/orders";
import { notifyNewOrder } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";
    const isAllowed = await checkRateLimit(`order_${ip}`, 10, 10 * 60 * 1000);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many order submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse & validate body
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid order submission." },
        { status: 400 }
      );
    }

    const { customerName, phone, address, city, notes, items } = parsed.data;

    const normalizedPhone = normalizePkPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid Pakistani phone number format." },
        { status: 400 }
      );
    }

    // 3. Server-side product & price revalidation (NEVER trust client prices!)
    const variantIds = items.map((i) => i.variantId);
    const dbVariants = await db.productVariant.findMany({
      where: {
        id: { in: variantIds },
      },
      include: {
        product: true,
      },
    });

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      variant: (typeof dbVariants)[0];
      quantity: number;
    }> = [];

    for (const item of items) {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        return NextResponse.json(
          { error: "One or more selected products no longer exist." },
          { status: 400 }
        );
      }

      if (!variant.product.isActive || !variant.product.isAvailable) {
        return NextResponse.json(
          { error: `${variant.product.name} is currently unavailable.` },
          { status: 400 }
        );
      }

      calculatedSubtotal += variant.price * item.quantity;
      validatedItems.push({
        variant,
        quantity: item.quantity,
      });
    }

    // 4. Calculate delivery fee and total from settings
    const settings = await getSettings();
    const flatFee = Number(settings.deliveryFee) || 500;
    const freeThreshold = Number(settings.freeDeliveryThreshold) || 5000;

    const deliveryFee = calculatedSubtotal >= freeThreshold ? 0 : flatFee;
    const total = calculatedSubtotal + deliveryFee;

    // 5. Generate collision-safe reference number
    const referenceNo = await generateOrderReferenceNo();

    // 6. Save order and items in a database transaction
    const newOrder = await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          referenceNo,
          customerName,
          phone: normalizedPhone,
          address,
          city,
          notes: notes || null,
          status: "NEW",
          subtotal: calculatedSubtotal,
          deliveryFee,
          total,
          paymentMethod: "COD",
        },
      });

      for (const valItem of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: valItem.variant.productId,
            variantId: valItem.variant.id,
            nameSnapshot: valItem.variant.product.name,
            labelSnapshot: valItem.variant.label,
            priceSnapshot: valItem.variant.price,
            quantity: valItem.quantity,
          },
        });
      }

      return order;
    });

    // Fire notifications asynchronously without delaying response
    notifyNewOrder({
      id: newOrder.id,
      referenceNo: newOrder.referenceNo,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      address: newOrder.address,
      city: newOrder.city,
      notes: newOrder.notes,
      subtotal: newOrder.subtotal,
      deliveryFee: newOrder.deliveryFee,
      total: newOrder.total,
      items: validatedItems.map((valItem) => ({
        nameSnapshot: valItem.variant.product.name,
        labelSnapshot: valItem.variant.label,
        priceSnapshot: valItem.variant.price,
        quantity: valItem.quantity,
      })),
    }).catch((err) => console.error("Notification trigger error:", err));

    return NextResponse.json({
      ok: true,
      referenceNo: newOrder.referenceNo,
      total: newOrder.total,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again or reach out via WhatsApp." },
      { status: 500 }
    );
  }
}
