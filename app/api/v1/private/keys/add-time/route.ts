import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { days, keyId } = await req.json();
    const parsedDays = parseInt(String(days), 10);

    if (isNaN(parsedDays) || parsedDays <= 0) {
      return NextResponse.json(
        { error: "กรุณาระบุจำนวนวันที่ถูกต้อง (มากกว่า 0 วัน)" },
        { status: 400 }
      );
    }

    const addMs = parsedDays * 24 * 60 * 60 * 1000;
    const nowMs = Date.now();

    // 1. Specific key
    if (keyId) {
      const key = await prisma.key.findUnique({
        where: { id: keyId },
      });
      if (!key) {
        return NextResponse.json(
          { error: "ไม่พบคีย์ที่ต้องการเพิ่มเวลา" },
          { status: 404 }
        );
      }

      const { expiresAt: currentExpiresAt } = key;

      let updated;
      if (currentExpiresAt) {
        // Key already activated: extend expiration date
        const currentExpiryMs = currentExpiresAt.getTime();
        const baseMs = currentExpiryMs > nowMs ? currentExpiryMs : nowMs;
        const newExpiry = new Date(baseMs + addMs);
        updated = await prisma.key.update({
          where: { id: keyId },
          data: {
            expiresAt: newExpiry,
            durationDays: { increment: parsedDays },
          },
        });
      } else {
        // Key not yet activated: increment durationDays (expiresAt remains null)
        updated = await prisma.key.update({
          where: { id: keyId },
          data: {
            durationDays: { increment: parsedDays },
          },
        });
      }

      const {
        durationDays,
        activatedAt,
        hwidResetAt,
        expiresAt,
        createdAt,
        updatedAt,
      } = updated;

      return NextResponse.json({
        success: true,
        message: `เพิ่มเวลาให้คีย์สำเร็จ (+${parsedDays} วัน)`,
        key: {
          ...updated,
          durationDays,
          activatedAt: activatedAt ? activatedAt.toISOString() : null,
          hwidResetAt: hwidResetAt ? hwidResetAt.toISOString() : null,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      });
    }

    // 2. Add time to ALL keys
    const allKeys = await prisma.key.findMany({
      select: { id: true, expiresAt: true },
    });

    if (allKeys.length === 0) {
      return NextResponse.json({
        success: true,
        message: "ไม่มีคีย์ในระบบ",
        count: 0,
      });
    }

    await prisma.$transaction(
      allKeys.map(({ id, expiresAt }) => {
        if (expiresAt) {
          const curMs = expiresAt.getTime();
          const baseMs = curMs > nowMs ? curMs : nowMs;
          const newExpiry = new Date(baseMs + addMs);
          return prisma.key.update({
            where: { id },
            data: {
              expiresAt: newExpiry,
              durationDays: { increment: parsedDays },
            },
          });
        } else {
          return prisma.key.update({
            where: { id },
            data: {
              durationDays: { increment: parsedDays },
            },
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: `เพิ่มเวลาให้คีย์ทั้งหมด ${allKeys.length} รายการเรียบร้อยแล้ว (+${parsedDays} วัน)`,
      count: allKeys.length,
    });
  } catch (error) {
    console.error("POST /api/v1/private/keys/add-time error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มเวลาคีย์" },
      { status: 500 }
    );
  }
}
