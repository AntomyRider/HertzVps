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
    const categoryId = searchParams.get("categoryId")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const formattedProducts = products.map(
      ({
        id,
        categoryId: prodCategoryId,
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
      }) => ({
        id,
        categoryId: prodCategoryId,
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
      })
    );

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Private Products GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { name, price, categoryId, image, description } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "ชื่อสินค้า (name) เป็นข้อมูลจำเป็น" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json(
        { error: "ราคาสินค้า (price) ต้องเป็นตัวเลขที่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string" || categoryId.trim().length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุหมวดหมู่สินค้า (categoryId)" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "ไม่พบหมวดหมู่ที่เลือก" },
        { status: 400 }
      );
    }

    const { id: validCategoryId } = categoryExists;
    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    const imageUrl = typeof image === "string" && image.trim().length > 0 ? image.trim() : null;
    const desc = typeof description === "string" && description.trim().length > 0 ? description.trim() : null;

    const {
      id: prodId,
      categoryId: prodCategoryId,
      category: { name: categoryName },
      name: prodName,
      price: prodPrice,
      stock,
      image: prodImage,
      description: prodDescription,
      soldCount,
      totalRevenue,
      createdAt,
      updatedAt,
    } = await prisma.product.create({
      data: {
        name: trimmedName,
        price: parsedPrice,
        categoryId: validCategoryId,
        stock: "", // Stock is omitted from form for now, default to empty string
        image: imageUrl,
        description: desc,
      },
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

    return NextResponse.json(
      {
        success: true,
        product: {
          id: prodId,
          categoryId: prodCategoryId,
          categoryName,
          name: prodName,
          price: Number(prodPrice),
          stock,
          image: prodImage,
          description: prodDescription,
          soldCount,
          totalRevenue: Number(totalRevenue),
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Private Product POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { count } = await prisma.product.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `ลบสินค้าทั้งหมดเรียบร้อยแล้ว (${count} รายการ)`,
      count,
    });
  } catch (error: any) {
    console.error("Private Products DELETE All Error:", error);
    return NextResponse.json(
      { error: "Failed to delete all products" },
      { status: 500 }
    );
  }
}
