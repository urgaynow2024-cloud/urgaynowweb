import "server-only";
import { prisma } from "@/lib/db";

export type MetricEnvironment = "production" | "staging" | "development";

export interface RecordMetricOptions {
  key: string;
  label: string;
  value: number;
  unit?: string;
  kind?: "gauge" | "rate";
  status?: string;
  detail?: string;
  source: string;
  region?: string;
  environment?: MetricEnvironment;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function recordMetric(opts: RecordMetricOptions): Promise<void> {
  const {
    key,
    label,
    value,
    unit = "",
    kind = "gauge",
    status = "operational",
    detail = "",
    source,
    region,
    environment = "production",
    metadata,
  } = opts;

  const metadataJson = metadata && Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : "";

  await prisma.statusMetric.create({
    data: {
      key,
      label,
      unit,
      kind,
      value,
      status,
      detail,
      source,
      region: region ?? null,
      environment,
      metadata: metadataJson,
    },
  }).catch(() => {});
}

export type BucketSize = 1 | 5 | 60;

export interface UpdateBucketOptions {
  metricKey: string;
  bucketStart: Date;
  bucketSize: BucketSize;
  value: number;
  unit: string;
  source: string;
  region?: string;
  environment?: MetricEnvironment;
  isSuccess?: boolean;
  isFailure?: boolean;
}

export async function updateMetricBucket(opts: UpdateBucketOptions): Promise<void> {
  const {
    metricKey,
    bucketStart,
    bucketSize,
    value,
    unit,
    source,
    region,
    environment = "production",
    isSuccess = true,
    isFailure = false,
  } = opts;

  const start = new Date(bucketStart);
  start.setMinutes(Math.floor(start.getMinutes() / bucketSize) * bucketSize, 0, 0);
  const regionValue = region ?? "";

  try {
    const existing = await prisma.statusMetricBucket.findFirst({
      where: {
        metricKey,
        bucketStart: start,
        bucketSize,
        environment,
        source,
        region: regionValue,
      },
    });

    if (existing) {
      const newCount = existing.count + 1;
      const newSum = existing.sum + value;
      const newMin = Math.min(existing.min ?? value, value);
      const newMax = Math.max(existing.max ?? value, value);
      const newSuccessCount = existing.successCount + (isSuccess ? 1 : 0);
      const newFailureCount = existing.failureCount + (isFailure ? 1 : 0);

      let p50 = existing.p50;
      let p75 = existing.p75;
      let p95 = existing.p95;
      let p99 = existing.p99;

      if (newCount >= 2) {
        const sorted = [value];
        p50 = percentile(sorted, 0.5);
        p75 = percentile(sorted, 0.75);
        p95 = percentile(sorted, 0.95);
        p99 = percentile(sorted, 0.99);
      }

      await prisma.statusMetricBucket.update({
        where: { id: existing.id },
        data: {
          count: newCount,
          sum: newSum,
          min: newMin,
          max: newMax,
          successCount: newSuccessCount,
          failureCount: newFailureCount,
          p50,
          p75,
          p95,
          p99,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.statusMetricBucket.create({
        data: {
          metricKey,
          bucketStart: start,
          bucketSize,
          count: 1,
          sum: value,
          min: value,
          max: value,
          successCount: isSuccess ? 1 : 0,
          failureCount: isFailure ? 1 : 0,
          p50: value,
          p75: value,
          p95: value,
          p99: value,
          unit,
          source,
          region: regionValue || null,
          environment,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  } catch {
    // swallow bucket write errors — metrics must never break requests
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function getBucketStart(bucketSize: BucketSize, timestamp: Date = new Date()): Date {
  const d = new Date(timestamp);
  d.setMinutes(Math.floor(d.getMinutes() / bucketSize) * bucketSize, 0, 0);
  return d;
}
