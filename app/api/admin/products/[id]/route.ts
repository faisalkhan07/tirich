import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive, isAvailable, unitPrice, variants } = body;

    const productUpdate: {
      isActive?: boolean;
      isAvailable?: boolean;
      unitPrice?: number | null;
    } = {};

    if (typeof isActive === "boolean") productUpdate.isActive = isActive;
    if (typeof isAvailable === "boolean") productUpdate.isAvailable = isAvailable;
    if (unitPrice !== undefined) productUpdate.unitPrice = unitPrice === null || unitPrice === "" ? null : Number(unitPrice);

    // Update product
    const updated = await db.product.update({
      where: { id },
      data: productUpdate,
    });

    // Update variants if provided (for Jams)
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id && typeof v.price === "number") {
          await db.productVariant.update({
            where: { id: v.id },
            data: { price: Number(v.price) },
          });
        }
      }
    }

    return NextResponse.json({ ok: true, product: updated });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}
