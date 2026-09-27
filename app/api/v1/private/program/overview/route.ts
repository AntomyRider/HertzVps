import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getProgramOverviewData } from "@/lib/controllerHub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const keys = await prisma.key.findMany({
      where: {
        activatedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        code: true,
        isActive: true,
        durationDays: true,
        hwid: true,
        activatedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const overview = getProgramOverviewData(keys);

    return NextResponse.json(overview);
  } catch (err) {
    console.error("GET /api/v1/private/program/overview error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลภาพรวมของโปรแกรม" },
      { status: 500 }
    );
  }
}
