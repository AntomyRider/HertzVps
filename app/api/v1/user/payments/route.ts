import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนดูประวัติการทำรายการ" },
      { status: 401 }
    );
  }

  const { id: userId } = user;

  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        voucherCode: true,
        senderName: true,
        note: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      payments: payments.map(
        ({
          id,
          amount,
          method,
          status,
          voucherCode,
          senderName,
          note,
          createdAt,
        }) => ({
          id,
          amount: Number(amount),
          method,
          status,
          voucherCode,
          senderName,
          note,
          createdAt: createdAt.toISOString(),
        })
      ),
    });
  } catch (error) {
    console.error("Fetch user payments error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงประวัติการเติมเงิน" },
      { status: 500 }
    );
  }
}
