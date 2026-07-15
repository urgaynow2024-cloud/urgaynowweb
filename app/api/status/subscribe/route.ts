import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// --- In-memory rate limiter (token bucket per IP) -------------------------
// Cheap, dependency-free protection against subscribe-form abuse. State lives
// per server instance; for multi-instance production this is a starting point
// and can later be backed by Upstash/KV. Never blocks legitimate one-off subs.
const LIMIT = 5; // requests
const WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
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
  const key = clientKey(req);
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: { email?: string; discordWebhook?: string; company?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* invalid JSON — validated below */
  }

  // Honeypot: real users never fill this hidden field; bots do.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true }); // silently accept to mislead bots
  }

  const email = (body.email ?? "").trim();
  const discordWebhook = (body.discordWebhook ?? "").trim();

  if (!email && !discordWebhook) {
    return NextResponse.json({ error: "Provide an email or Discord webhook." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (discordWebhook && !DISCORD_RE.test(discordWebhook)) {
    return NextResponse.json(
      { error: "Discord webhook must start with https://discord.com/api/webhooks/." },
      { status: 400 },
    );
  }

  // Never store more than necessary; webhooks stay server-side only and are
  // never returned by any public endpoint.
  try {
    await prisma.statusSubscriber.upsert({
      where: email ? { email } : { email: `__discord__${discordWebhook}` },
      create: {
        email: email || null,
        discordWebhook: email ? null : discordWebhook, // only store one channel per row
        verified: false,
      },
      update: email ? {} : { discordWebhook },
    });
  } catch {
    return NextResponse.json({ error: "Could not save subscription." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
