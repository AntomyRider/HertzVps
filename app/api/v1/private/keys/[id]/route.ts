import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;
    const { isActive, expiresAt } = await req.json();

    const dataToUpdate: any = {};
    if (typeof isActive === "boolean") {
      dataToUpdate.isActive = isActive;
    }
    if (expiresAt !== undefined) {
      dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const updatedKey = await prisma.key.update({
      where: { id },
      data: dataToUpdate,
    });

    const {
      activatedAt,
      hwidResetAt,
      expiresAt: updatedExpiresAt,
      createdAt,
      updatedAt,
    } = updatedKey;

    return NextResponse.json({
      success: true,
      key: {
        ...updatedKey,
        activatedAt: activatedAt ? activatedAt.toISOString() : null,
        hwidResetAt: hwidResetAt ? hwidResetAt.toISOString() : null,
        expiresAt: updatedExpiresAt ? updatedExpiresAt.toISOString() : null,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "ไม่พบคีย์ที่ระบุในระบบ" },
        { status: 404 }
      );
    }
    console.error("PATCH /api/v1/private/keys/[id] error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลคีย์" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;
    await prisma.key.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบคีย์สำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "ไม่พบคีย์ที่ต้องการลบในระบบ" },
        { status: 404 }
      );
    }
    console.error("DELETE /api/v1/private/keys/[id] error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบคีย์" },
      { status: 500 }
    );
  }
}
