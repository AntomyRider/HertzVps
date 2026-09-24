import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        discordId: true,
        name: true,
        avatar: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      id: userId,
      discordId,
      name,
      avatar,
      role,
      balance,
      createdAt,
      updatedAt,
    } = user;

    return NextResponse.json({
      user: {
        id: userId,
        discordId,
        name,
        avatar,
        role,
        balance: Number(balance),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Private User by ID GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status, user: adminUser } = await requireAdmin();
  if (!authorized || !adminUser) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;
    const { role, balance } = await req.json();

    const dataToUpdate: any = {};

    if (role !== undefined) {
      if (role !== "USER" && role !== "ADMIN") {
        return NextResponse.json(
          { error: "บทบาทผู้ใช้งานไม่ถูกต้อง (ต้องเป็น USER หรือ ADMIN)" },
          { status: 400 }
        );
      }

      // Prevent admin from removing their own admin role
      if (id === adminUser.id && role !== "ADMIN") {
        return NextResponse.json(
          { error: "ไม่สามารถลดระดับสิทธิ์ของบัญชีที่คุณกำลังใช้งานอยู่ได้" },
          { status: 400 }
        );
      }

      dataToUpdate.role = role;
    }

    if (balance !== undefined) {
      const parsedBalance = Number(balance);
      if (isNaN(parsedBalance) || parsedBalance < 0) {
        return NextResponse.json(
          { error: "ยอดเงินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0" },
          { status: 400 }
        );
      }
      dataToUpdate.balance = parsedBalance;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const {
      id: updatedId,
      discordId,
      name,
      avatar,
      role: updatedRole,
      balance: updatedBalance,
      createdAt,
      updatedAt,
    } = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        discordId: true,
        name: true,
        avatar: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedId,
        discordId,
        name,
        avatar,
        role: updatedRole,
        balance: Number(updatedBalance),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Private User PATCH Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized, error, status, user: adminUser } = await requireAdmin();
  if (!authorized || !adminUser) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { id } = await params;

    // Safety: prevent admin from deleting their own account
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "ไม่สามารถลบบัญชีของตัวเองที่กำลังเข้าสู่ระบบอยู่ได้" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบผู้ใช้งานเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Private User DELETE Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
