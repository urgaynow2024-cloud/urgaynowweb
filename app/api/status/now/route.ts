import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runHealthChecks, ensureDefaultServices } from "@/lib/status/health";
import {
  deriveOverall,
  OVERALL_STATUS_META,
  type OverallStatus,
  type ServiceStatus,
} from "@/lib/status/types";
import {
  readSnapshot,
  readSnapshotFromFile,
  writeSnapshot,
  type StatusSnapshot,
} from "@/lib/status/snapshot";
import { formatDateTime } from "@/lib/status/format";

// Public, unauthenticated live snapshot. Resilient by design:
//   1. If the database is reachable, derive the current status live (fresh).
//   2. If the database is down, serve the last cached snapshot from local
//      storage (written by the health-check job) so the page still works.
//   3. If even that is unavailable, run a live probe (no DB).
//   4. Only as a last resort report "Status Unavailable".
// At no point do we fabricate an "operational" status while checks are failing.
export const dynamic = "force-dynamic";

export async function GET() {
  // --- Path 1: live read from the database (authoritative when available) ---
  try {
    await ensureDefaultServices();
    const services = await prisma.statusService.findMany();
    if (services.length > 0) {
      const overall = deriveOverall(services.map((s) => ({ status: s.status as ServiceStatus }))) as OverallStatus;
      const om = OVERALL_STATUS_META[overall as OverallStatus];
      const [activeIncidents, activeMaintenance, subscriberCount] = await Promise.all([
        prisma.incident.count({ where: { published: true, status: { not: "resolved" } } }).catch(() => 0),
        prisma.maintenance.count({ where: { published: true, status: { in: ["scheduled", "in_progress"] } } }).catch(() => 0),
        prisma.statusSubscriber.count().catch(() => 0),
      ]);

      const snapshot: StatusSnapshot = {
        overall,
        label: om.label,
        emoji: om.emoji,
        text: om.text,
        generatedAt: new Date().toISOString(),
        source: "db",
        dbAvailable: true,
        services: services.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          category: s.category,
          status: s.status,
          latencyMs: null,
          lastCheckedAt: null,
          detail: "",
        })),
        activeIncidents,
        activeMaintenance,
        subscriberCount,
      };
      // Keep the resilient cache fresh for when the DB *does* go down later.
      writeSnapshot(snapshot);
      return json(snapshot);
    }
  } catch {
    /* database unreachable — continue to cached snapshot */
  }

  // --- Path 2: serve the last cached snapshot (independent of the DB) ---
  const cached = readSnapshot() ?? readSnapshotFromFile();
  if (cached) {
    return json({ ...cached, source: "snapshot" as const });
  }

  // --- Path 3: live probe without the database ---
  try {
    const { overall } = await runHealthChecks();
    const om = OVERALL_STATUS_META[overall as OverallStatus];
    return json({
      overall,
      label: om.label,
      emoji: om.emoji,
      text: om.text,
      generatedAt: new Date().toISOString(),
      source: "live" as const,
      dbAvailable: false,
      services: [],
      activeIncidents: 0,
      activeMaintenance: 0,
      subscriberCount: 0,
    });
  } catch {
    /* fall through */
  }

  // --- Path 4: total failure ---
  return json({
    overall: "major_outage",
    label: "Status Unavailable",
    emoji: "⚠️",
    text: "text-red-600 dark:text-red-400",
    generatedAt: new Date().toISOString(),
    source: "fallback" as const,
    dbAvailable: false,
    services: [],
    activeIncidents: 0,
    activeMaintenance: 0,
    subscriberCount: 0,
  });
}

export async function POST() {
  // Trigger a health-check pass (used by Vercel Cron & the admin "Run now" button).
  const { overall } = await runHealthChecks();
  const om = OVERALL_STATUS_META[overall as OverallStatus];
  return NextResponse.json({ overall, label: om.label });
}

function json(body: unknown) {
  const withLabel = {
    ...(body as Record<string, unknown>),
    updatedLabel: formatDateTime((body as any).generatedAt ?? new Date().toISOString()),
  };
  return NextResponse.json(withLabel, {
    headers: { "Cache-Control": "no-store" },
  });
}
