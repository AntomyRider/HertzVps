import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to process key status check (Read-Only)
async function checkKeyStatus(rawKey: unknown, rawHwid: unknown) {
  const cleanCode = typeof rawKey === "string" ? rawKey.trim() : "";
  const cleanHwid = typeof rawHwid === "string" ? rawHwid.trim() : "";

  if (!cleanCode) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "MISSING_KEY",
        message: "กรุณาระบุรหัสคีย์ (key หรือ code)",
      },
      { status: 400 }
    );
  }

  if (!cleanHwid) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "MISSING_HWID",
        message: "กรุณาระบุ Hardware ID (hwid)",
      },
      { status: 400 }
    );
  }

  // 1. Find key in database
  const key = await prisma.key.findUnique({
    where: { code: cleanCode },
  });

  if (!key) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "NOT_FOUND",
        message: "ไม่พบรหัสคีย์นี้ในระบบ กรุณาตรวจสอบความถูกต้อง",
      },
      { status: 404 }
    );
  }

  const {
    id,
    code,
    isActive,
    hwid: boundHwid,
    durationDays,
    activatedAt,
    expiresAt,
    hwidResetAt,
  } = key;

  // 2. Check if key is suspended/inactive
  if (!isActive) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "SUSPENDED",
        message: "คีย์นี้ถูกระงับหรือปิดการใช้งานโดยผู้ดูแลระบบ",
        data: {
          id,
          code,
          isActive,
        },
      },
      { status: 403 }
    );
  }

  // 3. Check if key is not yet activated/bound to any HWID
  if (!boundHwid) {
    return NextResponse.json(
      {
        success: true,
        valid: false,
        status: "UNACTIVATED",
        message: "คีย์นี้ยังไม่ถูกเปิดใช้งาน (ยังไม่ได้ผูกกับเครื่องใดๆ)",
        data: {
          id,
          code,
          isActive,
          durationDays,
          hwid: null,
          activatedAt: null,
          expiresAt: null,
          hwidResetAt,
        },
      },
      { status: 200 }
    );
  }

  // 4. Check HWID match
  if (boundHwid !== cleanHwid) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "HWID_MISMATCH",
        message: "คีย์นี้ถูกผูกกับเครื่องอื่นอยู่แล้ว กรุณารีเซ็ต HWID ก่อนเข้าใช้งาน",
        data: {
          id,
          code,
          isActive,
          hwidResetAt,
        },
      },
      { status: 403 }
    );
  }

  // 5. Check Expiration
  const now = new Date();
  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "EXPIRED",
        message: "คีย์นี้หมดอายุการใช้งานแล้ว",
        data: {
          id,
          code,
          isActive,
          hwid: boundHwid,
          durationDays,
          activatedAt: activatedAt?.toISOString() || null,
          expiresAt: expiresAt.toISOString(),
          isExpired: true,
          remainingDays: 0,
          remainingSeconds: 0,
          hwidResetAt,
        },
      },
      { status: 403 }
    );
  }

  // 6. Calculate remaining time
  const remainingMs = expiresAt ? Math.max(0, expiresAt.getTime() - now.getTime()) : durationDays * 24 * 60 * 60 * 1000;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const remainingSeconds = Math.floor(remainingMs / 1000);

  return NextResponse.json(
    {
      success: true,
      valid: true,
      status: "ACTIVE",
      message: "คีย์ถูกต้องและพร้อมใช้งาน",
      data: {
        id,
        code,
        isActive,
        hwid: boundHwid,
        durationDays,
        activatedAt: activatedAt?.toISOString() || null,
        expiresAt: expiresAt?.toISOString() || null,
        remainingDays,
        remainingSeconds,
        isExpired: false,
        hwidResetAt: hwidResetAt?.toISOString() || null,
      },
    },
    { status: 200 }
  );
}

// POST /api/v1/public/keys/status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { key, code, hwid } = body;
    const targetKey = key || code;
    return await checkKeyStatus(targetKey, hwid);
  } catch (err: any) {
    console.error("Key Status Check Error (POST):", err);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "SERVER_ERROR",
        error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      },
      { status: 500 }
    );
  }
}

// GET /api/v1/public/keys/status?key=...&hwid=... (or ?code=...&hwid=...)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const code = searchParams.get("code");
    const hwid = searchParams.get("hwid");
    const targetKey = key || code;
    return await checkKeyStatus(targetKey, hwid);
  } catch (err: any) {
    console.error("Key Status Check Error (GET):", err);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        status: "SERVER_ERROR",
        error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      },
      { status: 500 }
    );
  }
}
