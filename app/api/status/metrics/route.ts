import "server-only";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Range = "1h" | "6h" | "24h" | "7d";
type Interval = "1m" | "5m" | "1h";

const RANGE_MS: Record<Range, number> = {
  "1h": 1 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

const INTERVAL_MINUTES: Record<Interval, number> = {
  "1m": 1,
  "5m": 5,
  "1h": 60,
};

function parseRange(value: string | null): Range {
  if (value && value in RANGE_MS) return value as Range;
  return "24h";
}

function parseInterval(value: string | null): Interval {
  if (value && value in INTERVAL_MINUTES) return value as Interval;
  return "5m";
}

function toBucketStart(date: Date, bucketSize: number): Date {
  const d = new Date(date);
  d.setMinutes(Math.floor(d.getMinutes() / bucketSize) * bucketSize, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"));
  const interval = parseInterval(url.searchParams.get("interval"));
  const metric = url.searchParams.get("metric");
  const environment = url.searchParams.get("environment") || "production";

  const now = new Date();
  const since = new Date(now.getTime() - RANGE_MS[range]);
  const bucketSize = INTERVAL_MINUTES[interval];

  try {
    const [metricBuckets, rawMetrics] = await Promise.all([
      prisma.statusMetricBucket.findMany({
        where: {
          environment,
          bucketStart: { gte: since },
          ...(metric ? { metricKey: metric } : {}),
        },
        orderBy: { bucketStart: "asc" },
      }).catch(() => [] as any[]),
      prisma.statusMetric.findMany({
        where: {
          environment,
          recordedAt: { gte: since },
          ...(metric ? { key: metric } : {}),
        },
        orderBy: { recordedAt: "asc" },
      }).catch(() => [] as any[]),
    ]);

    const bucketMap = new Map<string, any[]>();
    for (const b of metricBuckets as any[]) {
      const arr = bucketMap.get(b.metricKey) || [];
      arr.push(b);
      bucketMap.set(b.metricKey, arr);
    }

    const rawMap = new Map<string, any[]>();
    for (const r of rawMetrics as any[]) {
      const arr = rawMap.get(r.key) || [];
      arr.push(r);
      rawMap.set(r.key, arr);
    }

    const allKeys = Array.from(new Set([...bucketMap.keys(), ...rawMap.keys()]));

    const metrics: Record<string, any> = {};

    for (const key of allKeys) {
      const buckets = bucketMap.get(key) || [];
      const points: any[] = [];

      for (const b of buckets) {
        const value = b.p95 ?? b.p75 ?? b.p50 ?? b.sum / Math.max(1, b.count);
        points.push({
          timestamp: b.bucketStart.toISOString(),
          value: Math.round(value * 100) / 100,
          sampleCount: b.count,
          p95: b.p95 ?? null,
          p75: b.p75 ?? null,
          p50: b.p50 ?? null,
          successCount: b.successCount,
          failureCount: b.failureCount,
        });
      }

      const raw = rawMap.get(key) || [];
      const lastUpdatedAt = raw.length > 0 ? raw[raw.length - 1].recordedAt.toISOString() : null;
      const stale = !lastUpdatedAt || now.getTime() - new Date(lastUpdatedAt).getTime() > bucketSize * 60 * 1000 * 2;

      const def = getMetricDef(key);
      if (!def && points.length === 0 && raw.length === 0) continue;

      metrics[key] = {
        key,
        label: def?.label || key,
        unit: def?.unit || "",
        statistic: def?.statistic || "value",
        lastUpdatedAt: lastUpdatedAt,
        stale,
        points,
      };
    }

    return NextResponse.json({
      generatedAt: now.toISOString(),
      range,
      interval,
      environment,
      metrics,
    });
  } catch (err) {
    console.error("[metrics] failed to load", err);
    return NextResponse.json(
      { error: "Could not load metrics." },
      { status: 500 },
    );
  }
}

function getMetricDef(key: string): { label: string; unit: string; statistic: string } | null {
  const map: Record<string, { label: string; unit: string; statistic: string }> = {
    website_response_time: { label: "Website response time", unit: "ms", statistic: "median" },
    api_latency: { label: "API latency", unit: "ms", statistic: "p75" },
    database_response_time: { label: "Database response time", unit: "ms", statistic: "median" },
    "api_request_count": { label: "API request volume", unit: "req/s", statistic: "rate" },
    "api_error_count": { label: "API error rate", unit: "%", statistic: "rate" },
    auth_success_count: { label: "Authentication success rate", unit: "%", statistic: "rate" },
    auth_failure_count: { label: "Authentication failure rate", unit: "%", statistic: "rate" },
  };
  return map[key] || null;
}
