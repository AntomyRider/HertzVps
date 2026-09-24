import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { authorized, error, status: authStatus } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status: authStatus });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const method = searchParams.get("method")?.trim().toUpperCase();
    const status = searchParams.get("status")?.trim().toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { voucherCode: { contains: search } },
        { senderName: { contains: search } },
        {
          user: {
            OR: [
              { name: { contains: search } },
              { discordId: { contains: search } },
            ],
          },
        },
      ];
    }

    if (method === "TRUEMONEY" || method === "BANKING") {
      where.method = method;
    }

    if (status === "PENDING" || status === "SUCCESS" || status === "REJECTED") {
      where.status = status;
    }

    const [
      total,
      payments,
      {
        _sum: { amount: totalSuccessAmount },
        _count: { id: totalSuccessCount },
      },
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              discordId: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      payments: payments.map(
        ({
          id,
          userId,
          user,
          amount,
          method: payMethod,
          status: payStatus,
          voucherCode,
          senderName,
          note,
          createdAt,
        }) => ({
          id,
          userId,
          userName: user?.name || "ไม่ทราบชื่อ",
          userDiscordId: user?.discordId || "",
          userAvatar: user?.avatar || null,
          amount: Number(amount),
          method: payMethod,
          status: payStatus,
          voucherCode,
          senderName,
          note,
          createdAt: createdAt.toISOString(),
        })
      ),
      total,
      summary: {
        totalRevenue: Number(totalSuccessAmount || 0),
        totalSuccessCount: totalSuccessCount || 0,
      },
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch admin payments error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงรายการชำระเงิน" },
      { status: 500 }
    );
  }
}
