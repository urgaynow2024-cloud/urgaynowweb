import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import {
  type ServiceStatus,
  type IncidentStatus,
  type MaintenanceStatus,
  type OverallStatus,
  type ServiceCategory,
  OVERALL_STATUS_META,
  SERVICE_CATEGORIES,
  isActiveIncident,
  isActiveMaintenance,
  deriveOverall,
} from "@/lib/status/types";
import { getMetricsForCharts } from "@/lib/status/metrics";
import { dailyStatus, latestHealth, type DayStatus } from "@/lib/status/uptime";
import { readSnapshotFromFile } from "@/lib/status/snapshot";
import { STATUS_TIMEZONE, tzAbbrev } from "@/lib/status/format";
import { StatusBanner } from "@/components/status/StatusBanner";
import { IncidentCard, type IncidentCardData } from "@/components/status/IncidentCard";
import { MaintenanceCard, type MaintenanceCardData } from "@/components/status/MaintenanceCard";
import { ServiceAccordion, type ServiceRowData } from "@/components/status/ServiceAccordion";
import { MetricsGrid } from "@/components/status/MetricsGrid";
import { PastIncidents } from "@/components/status/PastIncidents";
import { UptimeBars } from "@/components/status/UptimeBars";
import { StatusSubscribeForm } from "@/components/status/StatusSubscribeForm";
import { ApiExplorer } from "@/components/ApiExplorer";

const ENDPOINTS: {
  method: "GET" | "POST";
  path: string;
  access: string;
  desc: string;
}[] = [
  { method: "GET", path: "/api/status/now", access: "Public", desc: "Live overall system-status snapshot." },
  { method: "POST", path: "/api/status/subscribe", access: "Public", desc: "Subscribe to status updates via email or Discord webhook." },
  { method: "GET", path: "/status/rss.xml", access: "Public", desc: "Status updates as an RSS feed." },
  { method: "GET", path: "/status/atom.xml", access: "Public", desc: "Status updates as an Atom feed." },
  { method: "POST", path: "/api/gallery/submit", access: "Public", desc: "Submit a gallery photo (rate-limited, honeypot-protected)." },
  { method: "POST", path: "/api/blob", access: "Public", desc: "Get a scoped presigned URL to upload gallery images to Blob." },
  { method: "POST", path: "/api/status/now", access: "Internal", desc: "Trigger a health-check pass (Vercel Cron / admin console)." },
  { method: "GET", path: "/api/admin/rules", access: "Admin", desc: "List community rules (requires an admin session)." },
  { method: "POST", path: "/api/upload", access: "Admin", desc: "Upload an image to Blob storage (requires an admin session)." },
  { method: "POST", path: "/api/discord/webhook?secret=…", access: "Secret", desc: "Import a Discord message as the latest announcement." },
];

const METHOD_CLASS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  POST: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

const ACCESS_CLASS: Record<string, string> = {
  Public: "badge-success",
  Internal: "badge-brand",
  Admin: "badge-warning",
  Secret: "badge-danger",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{children}</h2>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 30;

export const metadata: Metadata = {
  title: "System Status & API",
  description: "Real-time status, incidents, maintenance, uptime and API reference for Ur Gay Now.",
  alternates: {
    types: {
      "application/rss+xml": "/status/rss.xml",
      "application/atom+xml": "/status/atom.xml",
    },
  },
};

function toIncidentData(inc: any): IncidentCardData {
  return {
    id: inc.id,
    title: inc.title,
    description: inc.description ?? "",
    status: inc.status,
    impact: inc.impact ?? "minor",
    createdAt: inc.createdAt,
    updatedAt: inc.updatedAt,
    updates: (inc.updates ?? []).map((u: any) => ({
      id: u.id,
      message: u.message,
      status: u.status,
      createdAt: u.createdAt,
    })),
    services: (inc.services ?? []).map((s: any) => ({ service: s.service ? { name: s.service.name } : null })),
  };
}

function toMaintenanceData(m: any): MaintenanceCardData {
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? "",
    status: m.status,
    startAt: m.startAt,
    endAt: m.endAt,
    createdAt: m.createdAt,
    updates: (m.updates ?? []).map((u: any) => ({ id: u.id, message: u.message, createdAt: u.createdAt })),
    services: (m.services ?? []).map((s: any) => ({ service: s.service ? { name: s.service.name } : null })),
  };
}

export default async function StatusPage() {
  const services = await safeQuery(
    () => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    null,
  );
  const dbAvailable = Array.isArray(services) && services.length > 0;

  // During a database outage, fall back to the cached snapshot so the page
  // still reflects reality (and never falsely claims "All Systems Operational").
  const snap = dbAvailable ? null : readSnapshotFromFile();

  const [incidentRows, maintenanceRows, metrics] = await Promise.all([
    safeQuery(
      () =>
        prisma.incident.findMany({
          where: { published: true },
          include: { updates: { orderBy: { createdAt: "asc" } }, services: { include: { service: true } } },
          orderBy: { createdAt: "desc" },
        }),
      [] as any[],
    ),
    safeQuery(
      () =>
        prisma.maintenance.findMany({
          where: { published: true },
          include: { updates: { orderBy: { createdAt: "asc" } }, services: { include: { service: true } } },
          orderBy: { startAt: "asc" },
        }),
      [] as any[],
    ),
    getMetricsForCharts(),
  ]);

  const incidents = (incidentRows as any[]) ?? [];
  const maintenances = (maintenanceRows as any[]) ?? [];

  const activeIncidents = incidents.filter((i) => isActiveIncident(i.status as IncidentStatus)).map(toIncidentData);
  const pastIncidents = incidents
    .filter((i) => !isActiveIncident(i.status as IncidentStatus))
    .map(toIncidentData)
    .slice(0, 30);
  const activeMaintenance = maintenances
    .filter((m) => isActiveMaintenance(m.status as MaintenanceStatus))
    .map(toMaintenanceData);

  // Map active incidents to their affected services (for the "related incident"
  // hint on each service row).
  const incidentByService = new Map<string, { id: string; title: string }>();
  for (const inc of activeIncidents) {
    const raw = incidents.find((r) => r.id === inc.id);
    for (const s of raw?.services ?? []) {
      if (s.serviceId) incidentByService.set(s.serviceId, { id: inc.id, title: inc.title });
    }
  }

  // Build the service rows. When the DB is reachable we enrich with uptime bars
  // and the latest health check; otherwise we degrade gracefully using the
  // cached snapshot.
  let serviceRows: ServiceRowData[] = [];

  if (dbAvailable && services) {
    serviceRows = await Promise.all(
      (services as any[]).map(async (s) => {
        const [days, health] = await Promise.all([dailyStatus(s.id, 90), latestHealth(s.id)]);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          category: s.category,
          description: s.description ?? "",
          status: s.status,
          latencyMs: health?.latencyMs ?? null,
          lastCheckedAt: health ? health.checkedAt.toISOString() : null,
          detail: health?.detail ?? "",
          days: (days as DayStatus[]) ?? [],
          relatedIncident: incidentByService.get(s.id) ?? null,
        } as ServiceRowData;
      }),
    );
  } else if (snap && snap.services.length > 0) {
    const snapped = new Map(snap.services.map((sv) => [sv.slug, sv]));
    serviceRows = (snap.services as any[]).map((sv) => ({
      id: sv.id,
      name: sv.name,
      slug: sv.slug,
      category: sv.category,
      description: "",
      status: sv.status,
      latencyMs: sv.latencyMs ?? null,
      lastCheckedAt: sv.lastCheckedAt ?? null,
      detail: sv.detail ?? "",
      days: [] as DayStatus[],
      relatedIncident: null,
    }));
    void snapped;
  }

  // Overall banner — always honest about outages.
  let overall: OverallStatus;
  let banner: any;
  if (dbAvailable && services) {
    overall = deriveOverall((services as any[]).map((s) => ({ status: s.status as ServiceStatus }))) as OverallStatus;
    banner = {
      overall,
      label: OVERALL_STATUS_META[overall].label,
      emoji: OVERALL_STATUS_META[overall].emoji,
      generatedAt: new Date().toISOString(),
      activeIncidents: activeIncidents.length,
      activeMaintenance: activeMaintenance.length,
    };
  } else if (snap) {
    banner = {
      overall: snap.overall,
      label: snap.label,
      emoji: snap.emoji,
      generatedAt: snap.generatedAt,
      activeIncidents: snap.activeIncidents,
      activeMaintenance: snap.activeMaintenance,
    };
  } else {
    banner = {
      overall: "major_outage" as OverallStatus,
      label: "Status Unavailable",
      emoji: "⚠️",
      generatedAt: new Date().toISOString(),
      activeIncidents: 0,
      activeMaintenance: 0,
    };
  }

  const grouped = SERVICE_CATEGORIES.map((cat) => ({
    cat: cat as ServiceCategory,
    rows: serviceRows.filter((s) => s.category === cat),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20">
      <header className="pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
          Ur Gay Now
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          System Status
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Live health, incidents, maintenance and uptime for the Ur Gay Now platform.
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          All times shown in {tzAbbrev()} ({STATUS_TIMEZONE}).
        </p>
      </header>

      {/* 1. Overall status banner */}
      <div className="mt-8">
        <StatusBanner initial={banner} />
      </div>

      {!dbAvailable && (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
          The live database is currently unreachable. Showing the last cached status snapshot.
          Detailed metrics and uptime history will return once the database is back.
        </p>
      )}

      {/* 2. Active incident / maintenance panel (ongoing only) */}
      {(activeIncidents.length > 0 || activeMaintenance.filter((m) => m.status === "in_progress").length > 0) && (
        <section aria-labelledby="active-heading" className="mt-10">
          <h2 id="active-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Active
          </h2>
          <div className="space-y-4">
            {activeMaintenance
              .filter((m) => m.status === "in_progress")
              .map((m) => (
                <MaintenanceCard key={m.id} m={m} anchorId={`maintenance-${m.id}`} />
              ))}
            {activeIncidents.map((i) => (
              <IncidentCard key={i.id} incident={i} anchorId={`incident-${i.id}`} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Service status list (expandable) */}
      <section aria-labelledby="services-heading" className="mt-10">
        <h2 id="services-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Services
        </h2>
        <div className="space-y-6">
          {grouped.map((g) => (
            <div key={g.cat}>
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">{g.cat}</h3>
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-ink-900">
                {g.rows.map((s) => (
                  <ServiceAccordion key={s.id} service={s} />
                ))}
              </div>
            </div>
          ))}
          {serviceRows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              Service list unavailable right now.
            </p>
          )}
        </div>
      </section>

      {/* 4. Scheduled maintenance (future windows) */}
      {activeMaintenance.length > 0 && (
        <section aria-labelledby="maint-heading" className="mt-10">
          <h2 id="maint-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Scheduled Maintenance
          </h2>
          <div className="space-y-4">
            {activeMaintenance
              .filter((m) => m.status === "scheduled")
              .map((m) => (
                <MaintenanceCard key={m.id} m={m} anchorId={`maintenance-${m.id}`} />
              ))}
          </div>
        </section>
      )}

      {/* 5. Live metrics */}
      <section aria-labelledby="metrics-heading" className="mt-10">
        <h2 id="metrics-heading" className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Live Metrics
        </h2>
        <p className="mb-4 text-xs text-zinc-400">
          Charts use real stored monitoring data. Metrics we don’t yet measure show an empty state rather than fake values.
        </p>
        <MetricsGrid series={metrics} />
      </section>

      {/* 7. Uptime history (90-day bars per service) */}
      <section aria-labelledby="uptime-heading" className="mt-10">
        <h2 id="uptime-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Uptime History
        </h2>
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-ink-900">
          {serviceRows
            .filter((s) => s.days.length > 0)
            .map((s) => (
              <div key={s.id} className="border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800">
                <p className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">{s.name}</p>
                <UptimeBars days={s.days} label="Last 90 days" />
              </div>
            ))}
          {serviceRows.filter((s) => s.days.length > 0).length === 0 && (
            <p className="py-3 text-sm text-zinc-400">No uptime history recorded yet.</p>
          )}
        </div>
      </section>

      {/* 6. Incident history */}
      <section aria-labelledby="history-heading" className="mt-10">
        <h2 id="history-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Incident History
        </h2>
        <PastIncidents incidents={pastIncidents} />
      </section>

      {/* 8. Subscribe */}
      <section aria-labelledby="subscribe-heading" className="mt-10">
        <h2 id="subscribe-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Get Notified
        </h2>
        <StatusSubscribeForm />
      </section>

      {/* 9. API — live explorer + endpoint reference */}
      <section id="api" aria-labelledby="api-heading" className="mt-10 scroll-mt-20">
        <h2 id="api-heading" className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          API
        </h2>
        <p className="mb-4 text-xs text-zinc-400">
          GET /api/status/now — the current system-status snapshot. Hit “Try it” to call it live.
        </p>
        <ApiExplorer />

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-ink-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {ENDPOINTS.map((e) => (
                  <tr key={e.method + e.path} className="bg-white dark:bg-zinc-950">
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${METHOD_CLASS[e.method]}`}>
                        {e.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-zinc-800 dark:text-zinc-100">{e.path}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ACCESS_CLASS[e.access] ?? "badge-neutral"}`}>{e.access}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{e.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ul className="mt-6 space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-ink-900 dark:text-zinc-400">
          <li>
            All responses are <code className="font-mono">application/json</code> and the status
            snapshot sets <code className="font-mono">Cache-Control: no-store</code>.
          </li>
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Public</span> routes need no
            authentication. <span className="font-medium text-zinc-800 dark:text-zinc-200">Admin</span> and{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Internal</span> routes require a
            session or an authorised caller.
          </li>
          <li>
            The status endpoint is designed to stay useful during a database outage by falling
            back to a cached snapshot and a live probe.
          </li>
        </ul>
      </section>

      <footer className="mt-12 text-center text-xs text-zinc-400">
        Prefer machine-readable updates? Subscribe via{" "}
        <a href="/status/rss.xml" className="font-medium text-brand-600 hover:underline dark:text-brand-300">RSS</a> or{" "}
        <a href="/status/atom.xml" className="font-medium text-brand-600 hover:underline dark:text-brand-300">Atom</a>.
      </footer>
    </div>
  );
}
