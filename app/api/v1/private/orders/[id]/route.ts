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

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        productId: true,
        productName: true,
        productImage: true,
        price: true,
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const {
      id: orderId,
      userId,
      productId,
      productName,
      productImage,
      price,
      deliveredStock,
      createdAt,
      updatedAt,
      user: { name: userName, discordId: userDiscordId, avatar: userAvatar },
    } = order;

    return NextResponse.json({
      order: {
        id: orderId,
        userId,
        userName,
        userDiscordId,
        userAvatar,
        productId,
        productName,
        productImage,
        price: Number(price),
        deliveredStock,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Private Order by ID GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
