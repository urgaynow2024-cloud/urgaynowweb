import { NextResponse } from "next/server";
import { cleanupOldMetrics } from "@/lib/status/health";

export const dynamic = "force-dynamic";

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  const expected = process.env.STATUS_MONITOR_CRON_SECRET;
  const vercelCron = req.headers.get("x-vercel-cron");

  const authed =
    (expected && secret && constantTimeCompare(secret, expected)) ||
    vercelCron === "1";

  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cleanupOldMetrics();
  return NextResponse.json({ ok: true, cleanedAt: new Date().toISOString() });
}
