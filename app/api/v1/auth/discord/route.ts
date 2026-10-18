import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const {
    DISCORD_CLIENT_ID: clientId,
    DISCORD_REDIRECT_URI: envRedirectUri,
  } = process.env;

  if (!clientId) {
    return NextResponse.json(
      { error: "DISCORD_CLIENT_ID is not configured in environment variables" },
      { status: 500 }
    );
  }

  // Determine current host and scheme
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  let redirectUri: string;

  if (envRedirectUri) {
    if (isLocalhost) {
      if (envRedirectUri.includes("localhost") || envRedirectUri.includes("127.0.0.1")) {
        redirectUri = envRedirectUri;
      } else {
        // If developer runs locally but envRedirectUri points to production, use localhost
        try {
          const parsed = new URL(envRedirectUri);
          redirectUri = `${proto}://${host}${parsed.pathname}`;
        } catch {
          redirectUri = `http://${host}/api/v1/auth/discord/callback`;
        }
      }
    } else {
      // Production
      redirectUri = envRedirectUri;
    }
  } else {
    // Automatic fallback
    redirectUri = isLocalhost
      ? `http://${host}/api/v1/auth/discord/callback`
      : "https://hertzx.xyz/api/v1/auth/discord/callback";
  }

  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production" && !isLocalhost;

  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  // Remember exact redirect_uri sent to Discord so callback can match it 100%
  cookieStore.set("oauth_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
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
