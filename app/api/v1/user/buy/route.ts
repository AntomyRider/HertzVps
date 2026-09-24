import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนทำรายการสั่งซื้อ" },
      { status: 401 }
    );
  }

  const { id: userId } = user;

  try {
    const { productId, quantity = 1 } = await req.json();

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสสินค้า (productId)" },
        { status: 400 }
      );
    }

    const buyQty = Math.max(1, parseInt(String(quantity), 10) || 1);

    // Execute atomic purchase transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch latest product info
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          image: true,
          soldCount: true,
          totalRevenue: true,
        },
      });

      if (!product) {
        throw new Error("ไม่พบสินค้าที่ต้องการสั่งซื้อในระบบ");
      }

      const {
        id: prodId,
        name: prodName,
        price: prodPrice,
        stock: prodStock,
        image: prodImage,
      } = product;

      // 2. Check stock
      const stockLines = prodStock
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (stockLines.length === 0) {
        throw new Error("ขออภัย สินค้าชิ้นนี้หมดสต็อกแล้ว");
      }

      if (stockLines.length < buyQty) {
        throw new Error(
          `ขออภัย สินค้าคงเหลือไม่เพียงพอ (มีพร้อมจำหน่าย ${stockLines.length} ชิ้น แต่คุณต้องการ ${buyQty} ชิ้น)`
        );
      }

      const deliveredLines = stockLines.slice(0, buyQty);
      const remainingStock = stockLines.slice(buyQty).join("\n");
      const deliveredStock = deliveredLines.join("\n");
      const productPrice = Number(prodPrice);
      const totalPrice = productPrice * buyQty;

      // 3. Verify user balance
      const dbUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, balance: true },
      });

      if (!dbUser) {
        throw new Error("ไม่พบข้อมูลผู้ใช้งาน");
      }

      const { balance: rawBalance } = dbUser;
      const currentBalance = Number(rawBalance);
      if (currentBalance < totalPrice) {
        throw new Error(
          `ยอดเงินคงเหลือไม่เพียงพอ (ต้องการ ฿${totalPrice.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })} แต่คุณมี ฿${currentBalance.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
          })})`
        );
      }

      // 4. Deduct user balance
      const { balance: newRawBalance } = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: totalPrice },
        },
        select: { balance: true },
      });

      // 5. Update product: deduct stock, increment soldCount & totalRevenue
      await tx.product.update({
        where: { id: prodId },
        data: {
          stock: remainingStock,
          soldCount: { increment: buyQty },
          totalRevenue: { increment: totalPrice },
        },
      });

      // 6. Record Order
      const { id: orderId, createdAt: orderCreatedAt } = await tx.order.create({
        data: {
          userId,
          productId: prodId,
          productName: prodName,
          productImage: prodImage,
          price: totalPrice,
          quantity: buyQty,
          deliveredStock,
        },
      });

      return {
        orderId,
        productName: prodName,
        quantity: buyQty,
        price: totalPrice,
        deliveredStock,
        newBalance: Number(newRawBalance),
        createdAt: orderCreatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      message: "สั่งซื้อสินค้าสำเร็จ",
      order: result,
    });
  } catch (error: any) {
    console.error("Buy Product Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการทำรายการสั่งซื้อ" },
      { status: 400 }
    );
  }
}
