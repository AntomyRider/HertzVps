import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { id: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { discordId: { contains: search } } },
      ];
    }

    const [
      total,
      orders,
      {
        _sum: { price: totalRevenueSum },
        _count: { id: totalOrdersCount },
      },
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          productId: true,
          productName: true,
          productImage: true,
          price: true,
          quantity: true,
          deliveredStock: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              discordId: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.aggregate({
        _sum: {
          price: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const formattedOrders = orders.map(
      ({
        id,
        userId,
        productId,
        productName,
        productImage,
        price,
        quantity,
        deliveredStock,
        createdAt,
        updatedAt,
        user: { name: userName, discordId: userDiscordId, avatar: userAvatar },
      }) => ({
        id,
        userId,
        userName,
        userDiscordId,
        userAvatar,
        productId,
        productName,
        productImage,
        price: Number(price),
        quantity:
          quantity ||
          (deliveredStock
            ? deliveredStock.split("\n").filter((l) => l.trim().length > 0).length
            : 1),
        deliveredStock,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      })
    );

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalOrders: totalOrdersCount || 0,
        totalRevenue: Number(totalRevenueSum || 0),
      },
    });
  } catch (error: any) {
    console.error("Private Orders GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
