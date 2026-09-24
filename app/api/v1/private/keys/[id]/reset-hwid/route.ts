import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;
    const updatedKey = await prisma.key.update({
      where: { id },
      data: {
        hwid: null,
        hwidResetAt: null,
      },
    });

    const { activatedAt, expiresAt, createdAt, updatedAt } = updatedKey;

    return NextResponse.json({
      success: true,
      message: "รีเซ็ต HWID ของคีย์สำเร็จแล้ว (ปลดล็อคเครื่องเรียบร้อย)",
      key: {
        ...updatedKey,
        activatedAt: activatedAt ? activatedAt.toISOString() : null,
        hwidResetAt: null,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "ไม่พบคีย์ที่ต้องการรีเซ็ต HWID" },
        { status: 404 }
      );
    }
    console.error("POST /api/v1/private/keys/[id]/reset-hwid error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการรีเซ็ต HWID" },
      { status: 500 }
    );
  }
}
