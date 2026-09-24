import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  enqueueRemoteCommand,
  type RemoteCommandItem,
} from "@/lib/controlHub";

export async function POST(req: NextRequest) {
  try {
    const { code, action, payload } = await req.json();

    const cleanCode = typeof code === "string" ? code.trim() : "";
    if (!cleanCode || !action) {
      return NextResponse.json(
        { error: "ข้อมูลคำสั่งไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const key = await prisma.key.findUnique({
      where: { code: cleanCode },
    });

    if (!key || !key.isActive) {
      return NextResponse.json(
        { error: "รหัสคีย์ไม่ถูกต้องหรือถูกระงับการใช้งาน" },
        { status: 403 }
      );
    }

    const command = enqueueRemoteCommand(
      cleanCode,
      action as RemoteCommandItem["action"],
      payload
    );

    return NextResponse.json({
      success: true,
      command,
    });
  } catch (error) {
    console.error("POST /api/v1/public/control/command error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งคำสั่ง" },
      { status: 500 }
    );
  }
}
