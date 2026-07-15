import "server-only";
import { prisma } from "@/lib/db";
import { METRIC_KEYS, METRIC_DEFS, MetricDef, MetricSeries, MetricPoint } from "@/lib/status/metric-defs";

export async function getMetricsForCharts(limit = 90): Promise<MetricSeries[]> {
  const rows = await prisma.statusMetric
    .findMany({
      where: { key: { in: METRIC_KEYS } },
      orderBy: { recordedAt: "asc" },
      select: { key: true, value: true, recordedAt: true, status: true },
    })
    .catch(() => []);

  const grouped = new Map<string, MetricPoint[]>();
  for (const r of rows) {
    const arr = grouped.get(r.key) || [];
    arr.push(r as MetricPoint);
    grouped.set(r.key, arr);
  }

  return (METRIC_DEFS as MetricDef[]).map((def) => ({
    def,
    points: (grouped.get(def.key) || []).slice(-limit),
  }));
}

export async function getLatestMetrics(): Promise<Record<string, MetricPoint | null>> {
  const out: Record<string, MetricPoint | null> = {};
  await Promise.all(
    (METRIC_DEFS as MetricDef[]).map(async (def) => {
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
