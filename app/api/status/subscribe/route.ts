import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export const dynamic = "force-dynamic";

const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || rec.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > LIMIT;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DISCORD_RE = /^https:\/\/discord\.com\/api\/webhooks\//;

export async function POST(req: Request) {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    const key = clientKey(req);
    if (rateLimited(key)) {
      status = 429;
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status },
      );
    }

    let body: { email?: string; discordWebhook?: string; company?: string } = {};
    try {
      body = await req.json();
    } catch {
      /* invalid JSON — validated below */
    }

    if (typeof body.company === "string" && body.company.length > 0) {
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ ok: true });
    }

    const email = (body.email ?? "").trim();
    const discordWebhook = (body.discordWebhook ?? "").trim();

    if (!email && !discordWebhook) {
      status = 400;
      return NextResponse.json({ error: "Provide an email or Discord webhook." }, { status });
    }
    if (email && !EMAIL_RE.test(email)) {
      status = 400;
      return NextResponse.json({ error: "Invalid email address." }, { status });
    }
    if (discordWebhook && !DISCORD_RE.test(discordWebhook)) {
      status = 400;
      return NextResponse.json(
        { error: "Discord webhook must start with https://discord.com/api/webhooks/." },
        { status },
      );
    }

    try {
      await prisma.statusSubscriber.upsert({
        where: email ? { email } : { email: `__discord__${discordWebhook}` },
        create: {
          email: email || null,
          discordWebhook: email ? null : discordWebhook,
          verified: false,
        },
        update: email ? {} : { discordWebhook },
      });
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ ok: true });
    } catch {
      status = 500;
      return NextResponse.json({ error: "Could not save subscription." }, { status });
    }
  } finally {
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/status/subscribe",
      bucketStart,
      bucketSize: 1,
      value: 1,
      unit: "req",
      source: "api-middleware",
      environment: "production",
      isSuccess,
      isFailure,
    }).catch(() => {});
    if (isFailure) {
      updateMetricBucket({
        metricKey: "api_error_count:/api/status/subscribe",
        bucketStart,
        bucketSize: 1,
        value: 1,
        unit: "err",
        source: "api-middleware",
        environment: "production",
        isSuccess: false,
        isFailure: true,
      }).catch(() => {});
    }
  }
}
