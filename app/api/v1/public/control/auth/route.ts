import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    const cleanCode = typeof code === "string" ? code.trim() : "";

    if (!cleanCode) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสคีย์ (License Key)" },
        { status: 400 }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code: cleanCode },
    });

    if (!key) {
      return NextResponse.json(
        { error: "ไม่พบรหัสคีย์นี้ในระบบ กรุณาตรวจสอบความถูกต้อง" },
        { status: 404 }
      );
    }

    const {
      id,
      code: keyCode,
      isActive,
      hwid,
      durationDays,
      activatedAt,
      hwidResetAt,
      expiresAt,
      createdAt,
    } = key;

    if (!isActive) {
      return NextResponse.json(
        { error: "คีย์นี้ถูกระงับหรือปิดการใช้งานโดยผู้ดูแลระบบ" },
        { status: 403 }
      );
    }

    const now = new Date();
    if (expiresAt && expiresAt < now) {
      return NextResponse.json(
        { error: "คีย์นี้หมดอายุการใช้งานแล้ว กรุณาต่ออายุคีย์" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ตรวจสอบรหัสคีย์สำเร็จ",
      key: {
        id,
        code: keyCode,
        isActive,
        hwid,
        durationDays,
        activatedAt: activatedAt?.toISOString() || null,
        hwidResetAt: hwidResetAt?.toISOString() || null,
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/v1/public/control/auth error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบรหัสคีย์" },
      { status: 500 }
    );
  }
}
