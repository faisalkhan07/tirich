import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { OrderStatus } from "@/lib/generated/prisma/enums";

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
    const { status, notes } = body;

    // Validate status if provided
    const validStatuses = Object.values(OrderStatus);
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const updateData: { status?: OrderStatus; notes?: string } = {};
    if (status) updateData.status = status;
    if (typeof notes === "string") updateData.notes = notes;

    const updated = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
