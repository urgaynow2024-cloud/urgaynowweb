import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rules = await prisma.rule.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        category: true,
        title: true,
        content: true,
        sortOrder: true,
      },
    });
    return NextResponse.json(rules);
  } catch (err) {
    console.error("Failed to load rules", err);
    return NextResponse.json(
      { error: "Failed to load rules." },
      { status: 500 },
    );
  }
}
