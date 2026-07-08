import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.rule.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return NextResponse.json(rules);
}
