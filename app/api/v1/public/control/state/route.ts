import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateControlSession } from "@/lib/controlHub";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim() || "";

    if (!code) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคีย์ (code)" },
        { status: 400 }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code },
    });

    if (!key || !key.isActive) {
      return NextResponse.json(
        { error: "รหัสคีย์ไม่ถูกต้องหรือถูกระงับการใช้งาน" },
        { status: 403 }
      );
    }

    const session = getOrCreateControlSession(code);
    const isOnline =
      session.lastSyncAt > 0 && Date.now() - session.lastSyncAt < 10000;

    return NextResponse.json({
      success: true,
      online: isOnline,
      lastSyncAt: session.lastSyncAt
        ? new Date(session.lastSyncAt).toISOString()
        : null,
      state: session.telemetry,
    });
  } catch (error) {
    console.error("GET /api/v1/public/control/state error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงสถานะระบบ" },
      { status: 500 }
    );
  }
}
