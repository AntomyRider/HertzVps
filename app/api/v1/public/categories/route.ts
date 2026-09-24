import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();

    const categories = await prisma.category.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : undefined,
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
        createdAt: "asc",
      },
    });

    const formattedCategories = categories.map(
      ({ id, name, image, _count: { products }, createdAt, updatedAt }) => ({
        id,
        name,
        image,
        productCount: products,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      })
    );

    return NextResponse.json({ categories: formattedCategories });
  } catch (error: any) {
    console.error("Public Categories GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
