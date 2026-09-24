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

    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : undefined;

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const formattedCategories = categories.map(
      ({ id, name, image, _count: { products }, createdAt, updatedAt }) => ({
        id,
        name,
        image,
        productCount: products,
        createdAt,
        updatedAt,
      })
    );

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Private Categories GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { name, image } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "ชื่อหมวดหมู่ (name) เป็นข้อมูลจำเป็น" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const imageUrl = typeof image === "string" && image.trim().length > 0 ? image.trim() : null;

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category: {
          ...category,
          productCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Private Category POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
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
    const { count } = await prisma.category.deleteMany({});
    return NextResponse.json({
      success: true,
      message: `ลบหมวดหมู่ทั้งหมดเรียบร้อยแล้ว (${count} รายการ)`,
      count,
    });
  } catch (error: any) {
    console.error("Private Categories DELETE All Error:", error);
    return NextResponse.json(
      { error: "Failed to delete all categories" },
      { status: 500 }
    );
  }
}

