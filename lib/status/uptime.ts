import "server-only";
import { prisma } from "@/lib/db";
import type { ServiceStatus } from "@/lib/status/types";

export type UptimeWindow = {
  key: "24h" | "7d" | "30d" | "90d";
  label: string;
  days: number;
  uptimePct: number;
  total: number;
  up: number;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Compute uptime % for each window from HealthCheck history.
 * A service is "up" for a check when that check's status is operational or
 * maintenance (maintenance is planned, not a failure). Falls back to 100% when
 * there is no probe history yet (e.g. a freshly created service).
 */
export async function computeUptime(serviceId: string): Promise<UptimeWindow[]> {
  const windows: { key: UptimeWindow["key"]; label: string; days: number }[] = [
    { key: "24h", label: "Last 24 Hours", days: 1 },
    { key: "7d", label: "Last 7 Days", days: 7 },
    { key: "30d", label: "Last 30 Days", days: 30 },
    { key: "90d", label: "Last 90 Days", days: 90 },
  ];

  const out: UptimeWindow[] = [];
  for (const w of windows) {
    const since = w.days <= 1 ? new Date(Date.now() - 24 * 3600 * 1000) : daysAgo(w.days);
    const rows = await prisma.healthCheck
      .findMany({
        where: { serviceId, checkedAt: { gte: since } },
        select: { ok: true, status: true },
      })
      .catch(() => []);

    const total = rows.length;
    const up = rows.filter((r) => r.ok || r.status === "maintenance").length;
    const uptimePct = total === 0 ? 100 : (up / total) * 100;
    out.push({ key: w.key, label: w.label, days: w.days, uptimePct, total, up });
  }
  return out;
}

/** Daily up/down counts for a sparkline (last `days` days). */
export async function uptimeSeries(serviceId: string, days = 90): Promise<{ date: string; pct: number }[]> {
  const since = daysAgo(days);
  const rows = await prisma.healthCheck
    .findMany({
      where: { serviceId, checkedAt: { gte: since } },
      select: { ok: true, status: true, checkedAt: true },
    })
    .catch(() => []);

  const byDay = new Map<string, { up: number; total: number }>();
  for (const r of rows) {
    const day = r.checkedAt.toISOString().slice(0, 10);
    const cur = byDay.get(day) ?? { up: 0, total: 0 };
    cur.total += 1;
    if (r.ok || (r.status as ServiceStatus) === "maintenance") cur.up += 1;
    byDay.set(day, cur);
  }
  return Array.from(byDay.entries())
    .map(([date, v]) => ({ date, pct: v.total === 0 ? 100 : (v.up / v.total) * 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
