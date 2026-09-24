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

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        description: true,
        soldCount: true,
        totalRevenue: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const {
      id: prodId,
      categoryId,
      category: { name: categoryName },
      name,
      price,
      stock,
      image,
      description,
      soldCount,
      totalRevenue,
      createdAt,
      updatedAt,
    } = product;

    return NextResponse.json({
      product: {
        id: prodId,
        categoryId,
        categoryName,
        name,
        price: Number(price),
        stock,
        image,
        description,
        soldCount,
        totalRevenue: Number(totalRevenue),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Private Product by ID GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

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
    const { name, price, categoryId, image, description, stock } =
      await req.json();

    const dataToUpdate: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "ชื่อสินค้า (name) ต้องไม่เป็นค่าว่าง" },
          { status: 400 }
        );
      }
      dataToUpdate.name = name.trim();
    }

    if (price !== undefined) {
      if (isNaN(Number(price))) {
        return NextResponse.json(
          { error: "ราคา (price) ต้องเป็นตัวเลขที่ถูกต้อง" },
          { status: 400 }
        );
      }
      dataToUpdate.price = Number(price);
    }

    if (categoryId !== undefined) {
      if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
        return NextResponse.json(
          { error: "กรุณาระบุหมวดหมู่สินค้า (categoryId)" },
          { status: 400 }
        );
      }
      const catExists = await prisma.category.findUnique({
        where: { id: categoryId.trim() },
        select: { id: true },
      });
      if (!catExists) {
        return NextResponse.json(
          { error: "ไม่พบหมวดหมู่ที่เลือก" },
          { status: 400 }
        );
      }
      dataToUpdate.categoryId = categoryId.trim();
    }

    if (image !== undefined) {
      dataToUpdate.image =
        typeof image === "string" && image.trim().length > 0 ? image.trim() : null;
    }

    if (description !== undefined) {
      dataToUpdate.description =
        typeof description === "string" && description.trim().length > 0
          ? description.trim()
          : null;
    }

    if (stock !== undefined) {
      if (typeof stock !== "string") {
        return NextResponse.json(
          { error: "ข้อมูลสต็อก (stock) ต้องเป็นข้อความ" },
          { status: 400 }
        );
      }
      dataToUpdate.stock = stock;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const {
      id: updatedId,
      categoryId: updatedCategoryId,
      category: { name: updatedCategoryName },
      name: updatedName,
      price: updatedPrice,
      stock: updatedStock,
      image: updatedImage,
      description: updatedDescription,
      soldCount: updatedSoldCount,
      totalRevenue: updatedTotalRevenue,
      createdAt,
      updatedAt,
    } = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        categoryId: true,
        name: true,
        price: true,
        stock: true,
        image: true,
        description: true,
        soldCount: true,
        totalRevenue: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updatedId,
        categoryId: updatedCategoryId,
        categoryName: updatedCategoryName,
        name: updatedName,
        price: Number(updatedPrice),
        stock: updatedStock,
        image: updatedImage,
        description: updatedDescription,
        soldCount: updatedSoldCount,
        totalRevenue: Number(updatedTotalRevenue),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Private Product PATCH Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบสินค้าเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Private Product DELETE Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
