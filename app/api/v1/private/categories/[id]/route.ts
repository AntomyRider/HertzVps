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

    const category = await prisma.category.findUnique({
      where: { id },
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
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const {
      id: catId,
      name,
      image,
      _count: { products },
      createdAt,
      updatedAt,
    } = category;

    return NextResponse.json({
      category: {
        id: catId,
        name,
        image,
        productCount: products,
        createdAt,
        updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Private Category by ID GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    const { name, image } = await req.json();

    const dataToUpdate: { name?: string; image?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "ชื่อหมวดหมู่ (name) ต้องไม่เป็นค่าว่าง" },
          { status: 400 }
        );
      }
      dataToUpdate.name = name.trim();
    }

    if (image !== undefined) {
      dataToUpdate.image =
        typeof image === "string" && image.trim().length > 0 ? image.trim() : null;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const {
      id: updatedId,
      name: updatedName,
      image: updatedImage,
      _count: { products },
      createdAt,
      updatedAt,
    } = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
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
    });

    return NextResponse.json({
      success: true,
      category: {
        id: updatedId,
        name: updatedName,
        image: updatedImage,
        productCount: products,
        createdAt,
        updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Private Category PATCH Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
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

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบหมวดหมู่เรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Private Category DELETE Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
