import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * Request-level security helpers: client IP extraction, salted IP hashing, and
 * a small in-process rate limiter.
 *
 * Raw IP addresses are never stored. Only a salted SHA-256 digest is persisted,
 * which is enough to enforce rate limits and spot duplicate submissions.
 */

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}

function ipSalt(): string {
  return process.env.AUTH_SECRET || process.env.UGN_IP_SALT || "ugn-development-ip-salt";
}

/** Salted, non-reversible digest of a client IP. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${ipSalt()}:${ip}`).digest("hex");
}

export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/** Case/space-insensitive fingerprint used for duplicate detection. */
export function fingerprint(parts: Array<string | number | null | undefined>): string {
  const normalized = parts
    .map((part) =>
      String(part ?? "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
    )
    .join("|");
  return createHash("sha256").update(normalized).digest("hex");
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  // Keep the in-memory map bounded on long-lived server instances.
  if (now - lastSweep < 60_000 && buckets.size < 5000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}