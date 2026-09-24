import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  updateSessionTelemetry,
  mergeGroupImagePreviews,
  popPendingCommands,
} from "@/lib/controlHub";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const {
      code,
      stats,
      dailyStats,
      accounts,
      groupsByAccount,
      imagePreviewsByGroup,
      config,
      logs,
      isAllRunning,
    } = await req.json();

    const cleanCode = typeof code === "string" ? code.trim() : "";
    if (!cleanCode) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสคีย์ (code)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code: cleanCode },
    });

    if (!key || !key.isActive) {
      return NextResponse.json(
        { error: "รหัสคีย์ไม่ถูกต้องหรือถูกระงับการใช้งาน" },
        { status: 403, headers: corsHeaders }
      );
    }

    if (
      stats ||
      dailyStats ||
      accounts ||
      groupsByAccount ||
      config ||
      logs ||
      typeof isAllRunning === "boolean"
    ) {
      updateSessionTelemetry(cleanCode, {
        ...(stats ? { stats } : {}),
        ...(Array.isArray(dailyStats) ? { dailyStats } : {}),
        ...(Array.isArray(accounts) ? { accounts } : {}),
        ...(groupsByAccount ? { groupsByAccount } : {}),
        ...(config ? { config } : {}),
        ...(Array.isArray(logs) ? { logs } : {}),
        ...(typeof isAllRunning === "boolean" ? { isAllRunning } : {}),
      });
    }

    if (imagePreviewsByGroup && typeof imagePreviewsByGroup === "object") {
      mergeGroupImagePreviews(cleanCode, imagePreviewsByGroup);
    }

    const commands = popPendingCommands(cleanCode);

    return NextResponse.json(
      {
        success: true,
        commands,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST /api/v1/public/control/sync error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการซิงค์ข้อมูล" },
      { status: 500, headers: corsHeaders }
    );
  }
}
