import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { IconActivity, IconPlus, IconMegaphone, IconCalendar } from "@/components/admin/ui/icons";
import {
  type ServiceStatus,
  type IncidentStatus,
  type MaintenanceStatus,
  type OverallStatus,
  SERVICE_STATUS_META,
  OVERALL_STATUS_META,
  deriveOverall,
  isActiveIncident,
  isActiveMaintenance,
} from "@/lib/status/types";
import { updateServiceStatus, ensureServices } from "./actions";
import { computeUptime } from "@/lib/status/uptime";
import { getLatestMetrics, METRIC_DEFS } from "@/lib/status/metrics";
import { statusColor } from "@/lib/status/colors";

export const metadata = { title: "Status", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminStatusPage() {
  await requireAdmin();
  const [services, incidents, maintenances, health] = await Promise.all([
    safeQuery(() => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }), [] as any[]),
    safeQuery(() => prisma.incident.findMany({ orderBy: { createdAt: "desc" }, take: 10 }), [] as any[]),
    safeQuery(() => prisma.maintenance.findMany({ orderBy: { startAt: "desc" }, take: 10 }), [] as any[]),
    safeQuery(
      () =>
        prisma.healthCheck.findMany({
          orderBy: { checkedAt: "desc" },
          take: 15,
          include: { service: true },
        }),
      [] as any[],
    ),
  ]);

  const overall = deriveOverall(services.map((s: any) => ({ status: s.status as ServiceStatus }))) as OverallStatus;
  const om = OVERALL_STATUS_META[overall as OverallStatus];
  const activeCount = incidents.filter((i: any) => isActiveIncident(i.status as IncidentStatus)).length;

  const [subscriberCount, latestMetrics] = await Promise.all([
    safeQuery(() => prisma.statusSubscriber.count(), 0),
    getLatestMetrics().catch(() => ({} as Record<string, any>)),
  ]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Status" }]}
        title="System Status"
        description="Monitor component health, manage incidents, and publish maintenance."
        actions={
          <form action={ensureServices as any}>
            <button type="submit" className="btn-primary btn-sm">
              <IconActivity size={16} /> Run health check
            </button>
          </form>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3 p-2">
          <span className="text-3xl" aria-hidden>{om.emoji}</span>
          <span className={`text-2xl font-bold ${om.text}`}>{om.label}</span>
          <span className="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
            {services.length} services Â· {activeCount} active incidents
          </span>
          <Link href="/admin/status/incidents" className="btn-secondary btn-sm">
            <IconMegaphone size={16} /> Incidents
          </Link>
          <Link href="/admin/status/maintenance" className="btn-secondary btn-sm">
            <IconCalendar size={16} /> Maintenance
          </Link>
        </div>
      </Card>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Services" value={String(services.length)} />
        <Stat label="Active incidents" value={String(activeCount)} />
        <Stat label="Subscribers" value={String(subscriberCount)} />
        <Stat label="Maintenance" value={String(maintenances.filter((m: any) => isActiveMaintenance(m.status as MaintenanceStatus)).length)} />
      </div>

      {/* Latest metrics */}
      <Card className="mb-6">
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Latest measured metrics</h2>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(latestMetrics as Record<string, any>).length === 0 && (
            <p className="col-span-full text-sm text-zinc-500">No metrics recorded yet. Run a health check to capture samples.</p>
          )}
          {Object.entries(latestMetrics as Record<string, { value: number; recordedAt: string; status: string }>).map(([key, m]) => {
            const def = METRIC_DEFS.find((d) => d.key === key);
            if (!def || !m) return null;
            const c = statusColor(m.status);
            return (
              <div key={key} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">{def.label}</p>
                  <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                </div>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                  {m.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  <span className="ml-1 text-xs font-medium text-zinc-400">{def.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Services */}
      <Card className="mb-6">
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Services</h2>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {services.map((s: any) => {
            const meta = SERVICE_STATUS_META[s.status as ServiceStatus];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="text-xl" aria-hidden>{meta.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-zinc-400">{s.category}{s.autoManaged && !s.manualOverride ? " Â· auto" : " Â· manual"}</p>
                </div>
                <form action={updateServiceStatus as any} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <select name="status" defaultValue={s.status} className="select py-1.5 text-sm">
                    {Object.entries(SERVICE_STATUS_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-zinc-500" title="Pin this status (stop auto-checks from overriding it)">
                    <input type="checkbox" name="manualOverride" defaultChecked={s.manualOverride} /> Lock
                  </label>
                  <button type="submit" className="btn-secondary btn-sm">Save</button>
                </form>
              </li>
            );
          })}
          {services.length === 0 && (
            <li className="p-4 text-sm text-zinc-500">No services yet. Click â€œRun health checkâ€ to seed the default list.</li>
          )}
        </ul>
      </Card>

      {/* Uptime */}
      <Card className="mb-6">
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-white">Uptime (90 days)</h2>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map((s: any) => (
            <UptimeMini key={s.id} serviceId={s.id} name={s.name} />
          ))}
        </div>
      </Card>

      {/* Health log */}
      <Card>
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
            <IconActivity size={18} /> Recent health checks
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Latency</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {health.map((h: any) => {
                const meta = SERVICE_STATUS_META[h.status as ServiceStatus];
                return (
                  <tr key={h.id}>
                    <td className="px-4 py-2">{h.service?.name ?? h.serviceId}</td>
                    <td className={`px-4 py-2 ${meta.text}`}>{meta.label}</td>
                    <td className="px-4 py-2 text-zinc-500">{h.latencyMs ? `${h.latencyMs}ms` : "â€”"}</td>
                    <td className="px-4 py-2 text-zinc-400">{new Date(h.checkedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
              {health.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-3 text-sm text-zinc-500">No checks recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

async function UptimeMini({ serviceId, name }: { serviceId: string; name: string }) {
  const w = await safeQuery(
    () => computeUptime(serviceId),
    [{ key: "90d", label: "Last 90 Days", days: 90, uptimePct: 100, total: 0, up: 0 }] as any,
  );
  const pct = w.find((x: any) => x.key === "90d")?.uptimePct ?? 100;
  const color = pct >= 99.9 ? "text-emerald-600 dark:text-emerald-400" : pct >= 98 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="truncate text-sm text-zinc-700 dark:text-zinc-300">{name}</p>
      <p className={`text-lg font-bold ${color}`}>{pct.toFixed(2)}%</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-ink-900">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

