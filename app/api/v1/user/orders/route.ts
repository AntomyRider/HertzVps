import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนดูประวัติการสั่งซื้อ" },
      { status: 401 }
    );
  }

  const { id: userId } = user;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productName: true,
        productImage: true,
        price: true,
        quantity: true,
        deliveredStock: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      orders: orders.map(
        ({
          id,
          productName,
          productImage,
          price,
          quantity,
          deliveredStock,
          createdAt,
        }) => {
          const stockCount = deliveredStock
            ? deliveredStock.split("\n").filter((l) => l.trim().length > 0).length
            : 1;
          return {
            id,
            productName,
            productImage,
            quantity: quantity || stockCount || 1,
            price: Number(price),
            deliveredStock,
            createdAt: createdAt.toISOString(),
          };
        }
      ),
    });
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงประวัติการสั่งซื้อ" },
      { status: 500 }
    );
  }
}
