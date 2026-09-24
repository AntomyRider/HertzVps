import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "hertz_server_jwt_secret_key_default_2026";
export const AUTH_COOKIE_NAME = "auth_token";

export interface JWTPayload {
  userId: string;
  discordId: string;
  role: "USER" | "ADMIN";
}

export function signJwt(payload: JWTPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getDiscordAvatarUrl(
  discordId: string,
  avatarHash: string | null | undefined,
  discriminator?: string
): string {
  if (avatarHash) {
    const isAnimated = avatarHash.startsWith("a_");
    const format = isAnimated ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${format}?size=256`;
  }

  if (!discriminator || discriminator === "0") {
    try {
      const index = Number((BigInt(discordId) >> BigInt(22)) % BigInt(6));
      return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    } catch {
      return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
  }

  const index = Number(discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        discordId: true,
        name: true,
        avatar: true,
        role: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      authorized: false as const,
      status: 401,
      error: "Unauthorized: Please log in",
      user: null,
    };
  }

  if (user.role !== "ADMIN") {
    return {
      authorized: false as const,
      status: 403,
      error: "Forbidden: Admin access required",
      user: null,
    };
  }

  return {
    authorized: true as const,
    status: 200,
    error: null,
    user,
  };
}
