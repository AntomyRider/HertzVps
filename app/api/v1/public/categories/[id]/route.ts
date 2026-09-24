import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            image: true,
            description: true,
            soldCount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const {
      id: categoryId,
      name,
      image,
      createdAt,
      updatedAt,
      products,
    } = category;

    const formattedProducts = products.map(
      ({
        id: prodId,
        name: prodName,
        price,
        stock,
        image: prodImage,
        description,
        soldCount,
        createdAt: prodCreatedAt,
      }) => ({
        id: prodId,
        name: prodName,
        price: Number(price),
        stock,
        image: prodImage,
        description,
        soldCount,
        createdAt: prodCreatedAt.toISOString(),
      })
    );

    return NextResponse.json({
      category: {
        id: categoryId,
        name,
        image,
        createdAt,
        updatedAt,
        products: formattedProducts,
      },
    });
  } catch (error: any) {
    console.error("Public Category by ID GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
