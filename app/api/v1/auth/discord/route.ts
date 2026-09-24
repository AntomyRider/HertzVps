import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  const {
    DISCORD_CLIENT_ID: clientId,
    DISCORD_REDIRECT_URI = "http://localhost:3000/api/v1/auth/discord/callback",
  } = process.env;
  const redirectUri = DISCORD_REDIRECT_URI;

  if (!clientId) {
    return NextResponse.json(
      { error: "DISCORD_CLIENT_ID is not configured in environment variables" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state: state,
    prompt: "consent",
  });

  const discordAuthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(discordAuthUrl);
}
