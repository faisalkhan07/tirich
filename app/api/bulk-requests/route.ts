import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bulkRequestSchema, normalizePkPhone } from "@/lib/validation";
import { checkRateLimit, generateBulkRequestReferenceNo } from "@/lib/orders";
import { notifyNewBulkRequest } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";
    const isAllowed = await checkRateLimit(`bulk_${ip}`, 10, 10 * 60 * 1000);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before submitting again." },
        { status: 429 }
      );
    }

    // 2. Parse & validate body
    const body = await req.json();
    const parsed = bulkRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid request submission." },
        { status: 400 }
      );
    }

    const { productId, quantity, deliveryDate, customerName, phone, city, notes, honeypot } =
      parsed.data;

    // Honeypot check
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const normalizedPhone = normalizePkPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid Pakistani phone number format." },
        { status: 400 }
      );
    }

    // 3. Verify product in database
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.type !== "FRUIT" || !product.isActive) {
      return NextResponse.json(
        { error: "Selected fruit is invalid or not available." },
        { status: 400 }
      );
    }

    // 4. Enforce minimum bulk quantity
    const minRequired = product.minQty || 5;
    if (quantity < minRequired) {
      return NextResponse.json(
        { error: `Minimum order for ${product.name} is ${minRequired} kg.` },
        { status: 400 }
      );
    }

    // 5. Generate reference number
    const referenceNo = await generateBulkRequestReferenceNo();

    // 6. Create BulkRequest
    const bulkRequest = await db.bulkRequest.create({
      data: {
        referenceNo,
        productId: product.id,
        quantity,
        unit: "KG",
        customerName,
        phone: normalizedPhone,
        city,
        deliveryDate: new Date(deliveryDate),
        notes: notes || null,
        status: "NEW",
      },
      include: {
        product: true,
      },
    });

    // Fire notifications asynchronously without delaying response
    notifyNewBulkRequest({
      id: bulkRequest.id,
      referenceNo: bulkRequest.referenceNo,
      customerName: bulkRequest.customerName,
      phone: bulkRequest.phone,
      city: bulkRequest.city,
      quantity: bulkRequest.quantity,
      deliveryDate: bulkRequest.deliveryDate,
      notes: bulkRequest.notes,
      product: {
        name: bulkRequest.product.name,
        unitPrice: bulkRequest.product.unitPrice,
      },
    }).catch((err) => console.error("Bulk request notification error:", err));

    return NextResponse.json({
      ok: true,
      referenceNo: bulkRequest.referenceNo,
      fruitName: bulkRequest.product.name,
    });
  } catch (error) {
    console.error("Bulk request error:", error);
    return NextResponse.json(
      { error: "Failed to submit bulk request. Please try again or reach out directly on WhatsApp." },
      { status: 500 }
    );
  }
}
