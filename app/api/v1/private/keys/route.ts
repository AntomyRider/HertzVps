import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import crypto from "crypto";

function generateKeyCode(): string {
  const seg1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const seg2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const seg3 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `HERTZ-${seg1}-${seg2}-${seg3}`;
}

export async function GET(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const duration = searchParams.get("duration")?.trim() || "";

    const where: any = {};
    if (search) {
      where.code = { contains: search };
    }
    if (duration && duration !== "all") {
      const parsedDays = parseInt(duration, 10);
      if (!isNaN(parsedDays)) {
        where.durationDays = parsedDays;
      }
    }

    const keys = await prisma.key.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      keys: keys.map((k) => ({
        ...k,
        activatedAt: k.activatedAt ? k.activatedAt.toISOString() : null,
        hwidResetAt: k.hwidResetAt ? k.hwidResetAt.toISOString() : null,
        expiresAt: k.expiresAt ? k.expiresAt.toISOString() : null,
        createdAt: k.createdAt.toISOString(),
        updatedAt: k.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/private/keys error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลคีย์" },
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
    const { count, durationDays, targetProductId } = await req.json();
    const validCount = Math.min(100, Math.max(1, parseInt(String(count || 1), 10)));
    const validDurationDays = Math.max(1, parseInt(String(durationDays || 30), 10));
    const cleanTargetProductId =
      typeof targetProductId === "string" && targetProductId.trim()
        ? targetProductId.trim()
        : null;

    const codesToCreate: string[] = [];
    while (codesToCreate.length < validCount) {
      const candidate = generateKeyCode();
      if (!codesToCreate.includes(candidate)) {
        codesToCreate.push(candidate);
      }
    }

    // Check existing in DB to ensure no collisions
    const existing = await prisma.key.findMany({
      where: { code: { in: codesToCreate } },
      select: { code: true },
    });
    const existingCodes = new Set(existing.map(({ code }) => code));

    const finalCodes: string[] = [];
    for (const c of codesToCreate) {
      if (!existingCodes.has(c)) {
        finalCodes.push(c);
      } else {
        // Regenerate replacement
        let newCode = generateKeyCode();
        while (finalCodes.includes(newCode) || existingCodes.has(newCode)) {
          newCode = generateKeyCode();
        }
        finalCodes.push(newCode);
      }
    }

    // Create keys: expiresAt is null until the key is actually redeemed
    const createdKeys = await prisma.$transaction(
      finalCodes.map((code) =>
        prisma.key.create({
          data: {
            code,
            isActive: true,
            durationDays: validDurationDays,
            expiresAt: null,
            activatedAt: null,
            hwid: null,
          },
        })
      )
    );

    // Optionally append created keys directly to target product stock
    let addedToProductName: string | null = null;
    if (cleanTargetProductId) {
      const product = await prisma.product.findUnique({
        where: { id: cleanTargetProductId },
        select: { id: true, name: true, stock: true },
      });

      if (product) {
        const { name: productName, stock: productStock } = product;
        const existingStockLines = productStock
          ? productStock.split("\n").map((l) => l.trim()).filter(Boolean)
          : [];
        const updatedStock = [...existingStockLines, ...finalCodes].join("\n");

        await prisma.product.update({
          where: { id: cleanTargetProductId },
          data: { stock: updatedStock },
        });

        addedToProductName = productName;
      }
    }

    return NextResponse.json(
      {
        success: true,
        addedToProductName,
        keys: createdKeys.map((k) => ({
          ...k,
          activatedAt: k.activatedAt ? k.activatedAt.toISOString() : null,
          hwidResetAt: k.hwidResetAt ? k.hwidResetAt.toISOString() : null,
          expiresAt: k.expiresAt ? k.expiresAt.toISOString() : null,
          createdAt: k.createdAt.toISOString(),
          updatedAt: k.updatedAt.toISOString(),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/private/keys error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างคีย์" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    let ids: string[] | undefined = undefined;
    try {
      const { ids: rawIds } = await req.json();
      if (Array.isArray(rawIds) && rawIds.length > 0) {
        ids = rawIds;
      }
    } catch {
      // Empty body -> delete all
    }

    const where: any = {};
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    const { count } = await prisma.key.deleteMany({ where });
    return NextResponse.json({
      success: true,
      message: ids
        ? `ลบคีย์ที่เลือกเรียบร้อยแล้ว (${count} รายการ)`
        : `ลบคีย์ทั้งหมดเรียบร้อยแล้ว (${count} รายการ)`,
      count,
    });
  } catch (error) {
    console.error("DELETE /api/v1/private/keys error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบคีย์" },
      { status: 500 }
    );
  }
}
