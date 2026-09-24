import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  popPendingCommands,
  updateSessionTelemetry,
} from "@/lib/controlHub";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim() || "";

    if (!code) {
      return NextResponse.json(
        { error: "Missing code" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code },
    });

    if (!key || !key.isActive) {
      return NextResponse.json(
        { error: "Invalid key" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const commands = popPendingCommands(code);

    return NextResponse.json(
      {
        success: true,
        commands,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/v1/public/control/client-commands error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client commands" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      code,
      stats,
      dailyStats,
      accounts,
      groupsByAccount,
      config,
      logs,
      isAllRunning,
    } = await req.json();

    const cleanCode = typeof code === "string" ? code.trim() : "";
    if (!cleanCode) {
      return NextResponse.json(
        { error: "Missing code" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    updateSessionTelemetry(cleanCode, {
      ...(stats ? { stats } : {}),
      ...(Array.isArray(dailyStats) ? { dailyStats } : {}),
      ...(Array.isArray(accounts) ? { accounts } : {}),
      ...(groupsByAccount ? { groupsByAccount } : {}),
      ...(config ? { config } : {}),
      ...(Array.isArray(logs) ? { logs } : {}),
      ...(typeof isAllRunning === "boolean" ? { isAllRunning } : {}),
    });

    return NextResponse.json(
      { success: true },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/v1/public/control/client-commands error:", error);
    return NextResponse.json(
      { error: "Failed to update client telemetry" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
