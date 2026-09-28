import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signLicenseToken } from "@/lib/license-token";

export async function POST(req: NextRequest) {
  try {
    const { code, hwid } = await req.json();
    const cleanCode = typeof code === "string" ? code.trim() : "";
    const cleanHwid = typeof hwid === "string" ? hwid.trim() : "";

    if (!cleanCode) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคีย์ (code)" },
        { status: 400 }
      );
    }

    if (!cleanHwid) {
      return NextResponse.json(
        { error: "กรุณาระบุ Hardware ID (hwid)" },
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
      id: keyId,
      code: keyCode,
      isActive,
      hwid: currentHwid,
      durationDays,
      activatedAt,
      expiresAt,
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

    // Check HWID
    if (!currentHwid) {
      // First activation on this device - countdown starts now!
      const effectiveDurationDays = durationDays || 30;
      const calculatedExpiresAt =
        expiresAt ||
        new Date(now.getTime() + effectiveDurationDays * 24 * 60 * 60 * 1000);

      const {
        code: actCode,
        isActive: actIsActive,
        hwid: actHwid,
        durationDays: actDurationDays,
        activatedAt: actActivatedAt,
        expiresAt: actExpiresAt,
      } = await prisma.key.update({
        where: { id: keyId },
        data: {
          hwid: cleanHwid,
          activatedAt: now,
          expiresAt: calculatedExpiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: "เปิดใช้งานคีย์และผูกเครื่องนี้สำเร็จเรียบร้อยแล้ว",
        licenseToken: signLicenseToken({
          code: actCode,
          hwid: actHwid || cleanHwid,
          licenseExpiresAt: actExpiresAt?.toISOString() || null,
        }),
        key: {
          code: actCode,
          isActive: actIsActive,
          hwid: actHwid,
          durationDays: actDurationDays,
          activatedAt: actActivatedAt?.toISOString() || null,
          expiresAt: actExpiresAt?.toISOString() || null,
        },
      });
    }

    // Existing HWID check
    if (currentHwid !== cleanHwid) {
      return NextResponse.json(
        {
          error:
            "Hardware ID (HWID) ไม่ตรงกับเครื่องที่ลงทะเบียนไว้ กรุณารีเซ็ต HWID ก่อนเปลี่ยนเครื่องใช้งาน",
        },
        { status: 403 }
      );
    }

    // Validated successfully
    return NextResponse.json({
      success: true,
      message: "ตรวจสอบสิทธิ์สำเร็จ",
      licenseToken: signLicenseToken({
        code: keyCode,
        hwid: currentHwid,
        licenseExpiresAt: expiresAt?.toISOString() || null,
      }),
      key: {
        code: keyCode,
        isActive,
        hwid: currentHwid,
        durationDays,
        activatedAt: activatedAt?.toISOString() || null,
        expiresAt: expiresAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/public/keys/redeem error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการตรวจสอบคีย์" },
      { status: 500 }
    );
  }
}
