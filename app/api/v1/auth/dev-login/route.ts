import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signJwt } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Only allowed in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Dev login is disabled in production mode" },
      { status: 403 }
    );
  }

  const rawAdminId = process.env.ADMIN_DISCORD_ID || "1048215319409328189";
  const adminDiscordId = rawAdminId.split(",")[0].trim();
  const adminName = process.env.ADMIN_NAME || "Dev Admin";

  try {
    const user = await prisma.user.upsert({
      where: { discordId: adminDiscordId },
      update: {
        role: "ADMIN",
        name: adminName,
      },
      create: {
        discordId: adminDiscordId,
        name: adminName,
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        role: "ADMIN",
        balance: 99999,
      },
    });

    const token = signJwt({
      userId: user.id,
      discordId: user.discordId,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    return NextResponse.redirect(new URL("/", `http://${host}`));
  } catch (error: any) {
    console.error("[Dev Login Error]:", error);
    return NextResponse.json(
      { error: "Database error during dev login", details: error?.message },
      { status: 500 }
    );
  }
}
