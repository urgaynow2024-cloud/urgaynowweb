import "server-only";
import { prisma } from "@/lib/db";
import type { ProbeResult } from "@/lib/status/health";

// Registry of live metrics shown on the public status page.
//
// RULE: a metric is only ever populated from REAL measured data. Metrics whose
// value we cannot actually measure yet (request volume, error rate, the
// success rates) are intentionally left empty — the chart component then shows
// a "No monitoring data available" state instead of inventing numbers.

export type MetricDef = {
  key: string;
  label: string;
  unit: string;
  kind: "gauge" | "rate";
  accent: string; // hex used by the chart
  // If set, the value is read from this service's probe latency (ms).
  sourceSlug?: string;
  // Short hint shown when no data exists yet.
  hint: string;
};

export const METRIC_DEFS: MetricDef[] = [
  {
    key: "website_response_time",
    label: "Website response time",
    unit: "ms",
    kind: "gauge",
    accent: "#a256bb",
    sourceSlug: "website",
    hint: "Measured from the live homepage probe.",
  },
  {
    key: "api_latency",
    label: "API latency",
    unit: "ms",
    kind: "gauge",
    accent: "#004dff",
    sourceSlug: "api",
    hint: "Measured from the status API probe.",
  },
  {
    key: "db_response_time",
    label: "Database response time",
    unit: "ms",
    kind: "gauge",
    accent: "#008026",
    sourceSlug: "database",
    hint: "Measured from the live database query.",
  },
  {
    key: "api_request_volume",
    label: "API request volume",
    unit: "req/s",
    kind: "gauge",
    accent: "#ff8c00",
    hint: "Not yet instrumented — wire up request logging to populate this chart.",
  },
  {
    key: "api_error_rate",
    label: "API error rate",
    unit: "%",
    kind: "rate",
    accent: "#e40303",
    hint: "Not yet instrumented — wire up error tracking to populate this chart.",
  },
  {
    key: "auth_success_rate",
    label: "Authentication success rate",
    unit: "%",
    kind: "rate",
    accent: "#750787",
    hint: "Not yet instrumented — capture login outcomes to populate this chart.",
  },
  {
    key: "checkout_success_rate",
    label: "Checkout success rate",
    unit: "%",
    kind: "rate",
    accent: "#008026",
    hint: "Not yet instrumented — capture checkout outcomes to populate this chart.",
  },
  {
    key: "payment_success_rate",
    label: "Payment success rate",
    unit: "%",
    kind: "rate",
    accent: "#ffed00",
    hint: "Not yet instrumented — capture provider outcomes to populate this chart.",
  },
  {
    key: "payment_webhook_success_rate",
    label: "Payment webhook success rate",
    unit: "%",
    kind: "rate",
    accent: "#bd7fce",
    hint: "Not yet instrumented — capture webhook delivery outcomes to populate this chart.",
  },
  {
    key: "email_delivery_success_rate",
    label: "Email delivery success rate",
    unit: "%",
    kind: "rate",
    accent: "#4d5467",
    hint: "Not yet instrumented — capture provider delivery receipts to populate this chart.",
  },
];

export const METRIC_KEYS = METRIC_DEFS.map((m) => m.key);

/**
 * Persist real measured samples after a health-check pass. Only metrics that
 * map to a measured probe latency are written; everything else stays empty.
 */
export async function recordMetrics(
  results: Record<string, ProbeResult>,
): Promise<void> {
  const now = new Date();
  const rows = [];
  for (const def of METRIC_DEFS) {
    if (!def.sourceSlug) continue;
    const r = results[def.sourceSlug];
    if (!r || typeof r.latencyMs !== "number") continue;
    rows.push({
      key: def.key,
      label: def.label,
      unit: def.unit,
      kind: def.kind,
      value: r.latencyMs,
      status: r.status,
      detail: r.detail ?? "",
      recordedAt: now,
    });
  }
  if (rows.length === 0) return;
  await prisma.statusMetric.createMany({ data: rows }).catch(() => {});
}

export type MetricPoint = {
  value: number;
  recordedAt: Date;
  status: string;
};

export type MetricSeries = {
  def: MetricDef;
  points: MetricPoint[];
};

/** Read the most recent `limit` samples for every registered metric. */
export async function getMetricsForCharts(limit = 90): Promise<MetricSeries[]> {
  const out: MetricSeries[] = [];
  for (const def of METRIC_DEFS) {
    const rows = await prisma.statusMetric
      .findMany({
        where: { key: def.key },
        orderBy: { recordedAt: "asc" },
        take: limit,
        select: { value: true, recordedAt: true, status: true },
      })
      .catch(() => []);
    out.push({ def, points: rows as MetricPoint[] });
  }
  return out;
}

/** Latest single value per metric key (for sparkline numbers in the admin). */
export async function getLatestMetrics(): Promise<Record<string, MetricPoint | null>> {
  const out: Record<string, MetricPoint | null> = {};
  await Promise.all(
    METRIC_DEFS.map(async (def) => {
      const row = await prisma.statusMetric
        .findFirst({
          where: { key: def.key },
          orderBy: { recordedAt: "desc" },
          select: { value: true, recordedAt: true, status: true },
        })
        .catch(() => null);
      out[def.key] = (row as MetricPoint) ?? null;
    }),
  );
  return out;
}
