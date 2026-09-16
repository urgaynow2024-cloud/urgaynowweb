import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const attempt = attempts.get(ip);

  if (attempt && now < attempt.resetAt && attempt.count >= MAX_PER_WINDOW) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  if (!attempt || now >= attempt.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    attempt.count += 1;
  }

  let payload: { message?: unknown; digest?: unknown; path?: unknown } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const message = String(payload.message || "Unknown client error").slice(0, 500);
  const digest = payload.digest ? String(payload.digest).slice(0, 100) : null;
  const path = payload.path ? String(payload.path).slice(0, 500) : null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) || null;

  try {
    await prisma.errorLog.create({ data: { message, digest, path, userAgent } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
