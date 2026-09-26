import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const maskBuyerName = (rawName: string): string => {
  const trimmed = rawName.trim();
  if (!trimmed) return "Use***";

  const parts = trimmed.split(/\s+/);
  const firstPart = parts[0];
  const visibleCount = firstPart.length > 3 ? 3 : Math.max(1, firstPart.length - 1);
  const maskedFirst = `${firstPart.slice(0, visibleCount)}***`;

  if (parts.length > 1) {
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${maskedFirst} ${lastInitial}.`;
  }

  return maskedFirst;
};

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        productName: true,
        productImage: true,
        price: true,
        quantity: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        product: {
          select: {
            image: true,
          },
        },
      },
    });

    const formattedOrders = orders.map(
      ({
        id,
        productName,
        productImage,
        price,
        quantity,
        createdAt,
        user,
        product,
      }) => ({
        id,
        buyerName: maskBuyerName(user?.name || "Member"),
        productName,
        productImage: productImage || product?.image || null,
        price: Number(price),
        quantity,
        createdAt: createdAt.toISOString(),
      })
    );

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Public Recent Orders GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    );
  }
}
