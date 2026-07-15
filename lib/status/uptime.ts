import "server-only";
import { prisma } from "@/lib/db";
import type { ServiceStatus } from "@/lib/status/types";

export type DayStatus = {
  date: string; // YYYY-MM-DD
  status: ServiceStatus | "unknown";
};

const WORST_RANK: Record<ServiceStatus | "unknown", number> = {
  unknown: 0,
  operational: 1,
  maintenance: 2,
  degraded: 3,
  partial_outage: 4,
  major_outage: 5,
};

/** Most recent HealthCheck for a service (or null). */
export async function latestHealth(serviceId: string) {
  return prisma.healthCheck
    .findFirst({
      where: { serviceId },
      orderBy: { checkedAt: "desc" },
    })
    .catch(() => null);
}

/**
 * Per-day status for the last `days` days. Each day is coloured by the WORST
 * status observed in that day's checks; days with no checks are "unknown"
 * (rendered as a neutral square, never as operational).
 */
export async function dailyStatus(serviceId: string, days = 90): Promise<DayStatus[]> {
  const since = daysAgo(days);
  const rows = await prisma.healthCheck
    .findMany({
      where: { serviceId, checkedAt: { gte: since } },
      select: { status: true, checkedAt: true },
    })
    .catch(() => []);

  const worstByDay = new Map<string, ServiceStatus>();
  for (const r of rows) {
    const day = r.checkedAt.toISOString().slice(0, 10);
    const cur = worstByDay.get(day);
    if (!cur || WORST_RANK[r.status as ServiceStatus] > WORST_RANK[cur]) {
      worstByDay.set(day, r.status as ServiceStatus);
    }
  }

  const out: DayStatus[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, status: worstByDay.get(key) ?? "unknown" });
  }
  return out;
}

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
  const windows: { key: UptimeWindow["key"]; label: string; days: number; since: Date }[] = [
    { key: "24h", label: "Last 24 Hours", days: 1, since: new Date(Date.now() - 24 * 3600 * 1000) },
    { key: "7d", label: "Last 7 Days", days: 7, since: daysAgo(7) },
    { key: "30d", label: "Last 30 Days", days: 30, since: daysAgo(30) },
    { key: "90d", label: "Last 90 Days", days: 90, since: daysAgo(90) },
  ];

  const since = windows[windows.length - 1].since;
  const rows = await prisma.healthCheck
    .findMany({
      where: { serviceId, checkedAt: { gte: since } },
      select: { ok: true, status: true, checkedAt: true },
    })
    .catch(() => []);

  const out: UptimeWindow[] = [];
  for (const w of windows) {
    const relevant = rows.filter((r) => r.checkedAt >= w.since);
    const total = relevant.length;
    const up = relevant.filter((r) => r.ok || r.status === "maintenance").length;
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

type DayServiceMap = Record<string, ServiceStatus>;

/** Batch fetch daily status for multiple services in parallel. */
export async function batchDailyStatus(serviceIds: string[], days = 90): Promise<Record<string, DayStatus[]>> {
  const since = daysAgo(days);
  const serviceIdSet = new Set(serviceIds);

  const rows = await prisma.healthCheck
    .findMany({
      where: { serviceId: { in: serviceIds }, checkedAt: { gte: since } },
      select: { serviceId: true, status: true, checkedAt: true },
    })
    .catch(() => []);

  const worstByDay = new Map<string, DayServiceMap>();
  for (const r of rows) {
    if (!serviceIdSet.has(r.serviceId)) continue;
    const day = r.checkedAt.toISOString().slice(0, 10);
    const dayMap = worstByDay.get(day) || {};
    const cur = dayMap[r.serviceId];
    const statusRank = WORST_RANK[r.status as ServiceStatus];
    if (!cur || statusRank > WORST_RANK[cur]) {
      dayMap[r.serviceId] = r.status as ServiceStatus;
    }
    worstByDay.set(day, dayMap);
  }

  const now = new Date();
  const allDays: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    allDays.push(d.toISOString().slice(0, 10));
  }

  const result: Record<string, DayStatus[]> = {};
  for (const sid of serviceIds) {
    result[sid] = allDays.map((date) => ({
      date,
      status: worstByDay.get(date)?.[sid] ?? "unknown",
    }));
  }
  return result;
}

/** Batch fetch latest health check for multiple services in parallel. */
export async function batchLatestHealth(serviceIds: string[]): Promise<Record<string, Awaited<ReturnType<typeof latestHealth>>>> {
  const rows = await prisma.healthCheck
    .findMany({
      where: { serviceId: { in: serviceIds } },
      orderBy: { checkedAt: "desc" },
      include: { service: true },
    })
    .catch(() => []);

  const latestByService = new Map<string, (typeof rows)[number]>();
  for (const r of rows) {
    if (!latestByService.has(r.serviceId)) {
      latestByService.set(r.serviceId, r);
    }
  }

  const result: Record<string, Awaited<ReturnType<typeof latestHealth>>> = {};
  for (const sid of serviceIds) {
    result[sid] = latestByService.get(sid) ?? null;
  }
  return result;
}
