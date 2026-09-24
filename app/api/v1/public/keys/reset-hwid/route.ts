import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const cleanCode = typeof code === "string" ? code.trim() : "";

    if (!cleanCode) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคีย์ (code)" },
        { status: 400 }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code: cleanCode },
    });

    if (!key) {
      return NextResponse.json(
        { error: "ไม่พบรหัสคีย์นี้ในระบบ" },
        { status: 404 }
      );
    }

    const { id: keyId, isActive, hwid, hwidResetAt } = key;

    if (!isActive) {
      return NextResponse.json(
        { error: "คีย์นี้ถูกระงับหรือปิดการใช้งานโดยผู้ดูแลระบบ" },
        { status: 403 }
      );
    }

    if (!hwid) {
      return NextResponse.json({
        success: true,
        message: "คีย์นี้ยังไม่ได้ผูกกับเครื่องใด สามารถนำไปใช้งานบนเครื่องใหม่ได้ทันที",
      });
    }

    // Cooldown check (1 day / 24 hours)
    const now = Date.now();
    if (hwidResetAt) {
      const elapsed = now - hwidResetAt.getTime();
      if (elapsed < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - elapsed;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.ceil(
          (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        return NextResponse.json(
          {
            error: `คุณสามารถรีเซ็ต HWID ได้วันละ 1 ครั้งเท่านั้น กรุณารออีก ${hours} ชั่วโมง ${minutes} นาที`,
            remainingSeconds: Math.ceil(remainingMs / 1000),
          },
          { status: 429 }
        );
      }
    }

    // Reset HWID
    await prisma.key.update({
      where: { id: keyId },
      data: {
        hwid: null,
        hwidResetAt: new Date(now),
      },
    });

    return NextResponse.json({
      success: true,
      message: "รีเซ็ต HWID สำเร็จ สามารถนำคีย์ไปเปิดใช้งานบนเครื่องใหม่ได้ทันที",
    });
  } catch (error) {
    console.error("POST /api/v1/public/keys/reset-hwid error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการรีเซ็ต HWID" },
      { status: 500 }
    );
  }
}
