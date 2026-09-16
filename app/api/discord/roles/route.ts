import { NextResponse } from "next/server";
import { listGuildRoles } from "@/lib/discord";

export const runtime = "nodejs";

/** Returns the guild's role list so admin forms can populate a role picker. */
export async function GET() {
  try {
    const roles = await listGuildRoles();
    return NextResponse.json({ roles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load Discord roles" },
      { status: 500 },
    );
  }
}