import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { BulkRequestStatus } from "@/lib/generated/prisma/enums";

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
    const { status, quotedPrice, adminNote } = body;

    const validStatuses = Object.values(BulkRequestStatus);
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid bulk request status." }, { status: 400 });
    }

    const updateData: {
      status?: BulkRequestStatus;
      quotedPrice?: number | null;
      adminNote?: string | null;
    } = {};

    if (status) updateData.status = status;
    if (quotedPrice !== undefined) updateData.quotedPrice = quotedPrice === null || quotedPrice === "" ? null : Number(quotedPrice);
    if (adminNote !== undefined) updateData.adminNote = adminNote || null;

    const updated = await db.bulkRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error("Bulk request update error:", error);
    return NextResponse.json({ error: "Failed to update bulk request." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db.bulkRequest.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bulk request deletion error:", error);
    return NextResponse.json({ error: "Failed to delete bulk request." }, { status: 500 });
  }
}
