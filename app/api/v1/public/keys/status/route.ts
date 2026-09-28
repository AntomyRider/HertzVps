import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signLicenseToken } from "@/lib/license-token";

export const dynamic = "force-dynamic";

interface StatusPayload {
  code?: string;
  hwid?: string;
}

async function handleCheckStatus({ code, hwid }: StatusPayload) {
  const cleanCode = typeof code === "string" ? code.trim() : "";
  const cleanHwid = typeof hwid === "string" ? hwid.trim() : "";

  if (!cleanCode) {
    return NextResponse.json(
      {
        valid: false,
        status: "INVALID_PARAM",
        error: "กรุณาระบุรหัสคีย์ (code)",
      },
      { status: 400 }
    );
  }

  // ค้นหาข้อมูลคีย์ในฐานข้อมูล (Read-Only)
  const keyRecord = await prisma.key.findUnique({
    where: { code: cleanCode },
  });

  if (!keyRecord) {
    return NextResponse.json(
      {
        valid: false,
        status: "NOT_FOUND",
        error: "ไม่พบรหัสคีย์นี้ในระบบ กรุณาตรวจสอบความถูกต้อง",
      },
      { status: 404 }
    );
  }

  const {
    code: keyCode,
    isActive,
    hwid: dbHwid,
    durationDays,
    activatedAt,
    expiresAt,
  } = keyRecord;

  // 1. ตรวจสอบสถานะการใช้งาน (ถูกระงับหรือไม่)
  if (!isActive) {
    return NextResponse.json(
      {
        valid: false,
        status: "INACTIVE",
        error: "คีย์นี้ถูกระงับหรือปิดการใช้งานโดยผู้ดูแลระบบ",
      },
      { status: 403 }
    );
  }

  const now = new Date();

  // 2. ตรวจสอบวันหมดอายุ
  if (expiresAt && expiresAt < now) {
    return NextResponse.json(
      {
        valid: false,
        status: "EXPIRED",
        error: "คีย์นี้หมดอายุการใช้งานแล้ว กรุณาต่ออายุคีย์",
        expiresAt: expiresAt.toISOString(),
      },
      { status: 403 }
    );
  }

  // 3. กรณีคีย์ยังไม่เคยผูกกับเครื่องใด (ยังไม่ได้ Redeem/Activate)
  if (!dbHwid) {
    return NextResponse.json({
      valid: true,
      status: "UNACTIVATED",
      message: "คีย์ถูกต้อง แต่ยังไม่เคยเปิดใช้งานหรือผูกกับเครื่องใด",
      key: {
        code: keyCode,
        isActive,
        isActivated: false,
        durationDays,
        remainingDays: durationDays,
        remainingSeconds: (durationDays || 30) * 86400,
        activatedAt: null,
        expiresAt: null,
      },
    });
  }

  // 4. ตรวจสอบความถูกต้องของ Hardware ID (HWID)
  if (cleanHwid && dbHwid !== cleanHwid) {
    return NextResponse.json(
      {
        valid: false,
        status: "HWID_MISMATCH",
        error:
          "Hardware ID (HWID) ไม่ตรงกับเครื่องที่ลงทะเบียนไว้ กรุณารีเซ็ต HWID ก่อนเปลี่ยนเครื่องใช้งาน",
      },
      { status: 403 }
    );
  }

  // 5. คำนวณเวลาคงเหลือ
  const remainingSeconds = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
    : (durationDays || 30) * 86400;

  // 6. ออก signed license token สำหรับการยืนยันแบบ offline ฝั่ง Desktop App
  const licenseToken = signLicenseToken({
    code: keyCode,
    hwid: dbHwid || cleanHwid,
    licenseExpiresAt: expiresAt?.toISOString() || null,
  });

  return NextResponse.json({
    valid: true,
    status: "ACTIVE",
    message: "คีย์ถูกต้องและพร้อมใช้งาน",
    licenseToken,
    key: {
      code: keyCode,
      isActive,
      isActivated: true,
      durationDays,
      remainingDays: Math.ceil(remainingSeconds / 86400),
      remainingSeconds,
      activatedAt: activatedAt?.toISOString() || null,
      expiresAt: expiresAt?.toISOString() || null,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { code, hwid } = await req.json().catch(() => ({}));
    return await handleCheckStatus({ code, hwid });
  } catch (error) {
    console.error("POST /api/v1/public/keys/status error:", error);
    return NextResponse.json(
      { valid: false, status: "ERROR", error: "เกิดข้อผิดพลาดในการตรวจสอบคีย์" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || undefined;
    const hwid = searchParams.get("hwid") || undefined;

    return await handleCheckStatus({ code, hwid });
  } catch (error) {
    console.error("GET /api/v1/public/keys/status error:", error);
    return NextResponse.json(
      { valid: false, status: "ERROR", error: "เกิดข้อผิดพลาดในการตรวจสอบคีย์" },
      { status: 500 }
    );
  }
}
