import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, getDiscordAvatarUrl, signJwt } from "@/lib/auth";

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // req.url reflects the bind address (0.0.0.0:3000) behind nginx/CF, not the public host —
  // derive the redirect base from the canonical OAuth origin instead
  const {
    DISCORD_REDIRECT_URI: redirectUri = "https://hertzx.xyz/api/v1/auth/discord/callback",
  } = process.env;
  const baseUrl = new URL("/", redirectUri);

  if (error || !code) {
    console.error("Discord OAuth error or missing code:", error);
    baseUrl.searchParams.set("auth_error", error || "missing_code");
    return NextResponse.redirect(baseUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  // Clean up state cookie
  cookieStore.delete("oauth_state");

  if (!state || state !== storedState) {
    console.error("Discord OAuth CSRF state mismatch:", { state, storedState });
    baseUrl.searchParams.set("auth_error", "invalid_state");
    return NextResponse.redirect(baseUrl);
  }

  const {
    DISCORD_CLIENT_ID: clientId,
    DISCORD_CLIENT_SECRET: clientSecret,
  } = process.env;

  if (!clientId || !clientSecret) {
    console.error("Discord credentials missing in environment variables");
    baseUrl.searchParams.set("auth_error", "server_misconfiguration");
    return NextResponse.redirect(baseUrl);
  }

  try {
    // 1. Exchange code for access token
    const tokenRequestBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const {
      data: { access_token: accessToken },
    } = await axios.post<DiscordTokenResponse>(
      "https://discord.com/api/oauth2/token",
      tokenRequestBody.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // 2. Fetch Discord User profile
    const {
      data: {
        id: discordId,
        username,
        global_name,
        avatar,
        discriminator,
      },
    } = await axios.get<DiscordUserResponse>(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const displayName = global_name || username;
    const avatarUrl = getDiscordAvatarUrl(discordId, avatar, discriminator);

    const adminDiscordIds = (
      process.env.ADMIN_DISCORD_ID || "1048215319409328189"
    )
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const isConfiguredAdmin = adminDiscordIds.includes(discordId);

    // 3. Upsert user in database
    const {
      id: userId,
      discordId: dbDiscordId,
      role,
    } = await prisma.user.upsert({
      where: { discordId },
      update: {
        name: displayName,
        avatar: avatarUrl,
        ...(isConfiguredAdmin ? { role: "ADMIN" } : {}),
      },
      create: {
        discordId,
        name: displayName,
        avatar: avatarUrl,
        role: isConfiguredAdmin ? "ADMIN" : "USER",
        balance: 0,
      },
    });

    // 4. Create JWT and set cookie
    const token = signJwt({
      userId,
      discordId: dbDiscordId,
      role,
    });

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.redirect(baseUrl);
  } catch (err: any) {
    console.error("Discord OAuth Callback Exception:", err.response?.data || err.message);
    baseUrl.searchParams.set("auth_error", "oauth_failed");
    return NextResponse.redirect(baseUrl);
  }
}
