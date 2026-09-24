import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { user: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id, discordId, name, avatar, role, balance, createdAt, updatedAt } =
    user;

  return NextResponse.json({
    user: {
      id,
      discordId,
      name,
      avatar,
      role,
      balance: Number(balance),
      createdAt,
      updatedAt,
    },
  });
}
