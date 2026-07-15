import { Container, PageHeader, Section } from "@/components/Container";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import {
  type ServiceStatus,
  type IncidentStatus,
  type MaintenanceStatus,
  type OverallStatus,
  type ServiceCategory,
  SERVICE_STATUS_META,
  OVERALL_STATUS_META,
  INCIDENT_STATUS_META,
  MAINTENANCE_STATUS_META,
  deriveOverall,
  isActiveIncident,
  isActiveMaintenance,
} from "@/lib/status/types";
import { computeUptime } from "@/lib/status/uptime";
import { StatusAutoRefresh } from "@/components/StatusAutoRefresh";
import { StatusSubscribeForm } from "@/components/StatusSubscribeForm";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export const metadata = {
  title: "System Status",
  description: "Real-time status and incident information for Ur Gay Now.",
};

function timeAgo(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function StatusPage() {
  const [services, incidents, maintenances] = await Promise.all([
    safeQuery(() => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }), [] as any[]),
    safeQuery(
      () => prisma.incident.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 25 }),
      [] as any[],
    ),
    safeQuery(
      () => prisma.maintenance.findMany({ where: { published: true }, orderBy: { startAt: "asc" } }),
      [] as any[],
    ),
  ]);

  const overall = deriveOverall(services.map((s) => ({ status: s.status as ServiceStatus })));
  const om = OVERALL_STATUS_META[overall as OverallStatus];

  const activeIncidents = incidents.filter((i) => isActiveIncident(i.status as IncidentStatus));
  const activeMaintenance = maintenances.filter((m) => isActiveMaintenance(m.status as MaintenanceStatus));
  const pastIncidents = incidents.filter((i) => !isActiveIncident(i.status as IncidentStatus)).slice(0, 10);

  const byCategory = (categories: ServiceCategory[]) => services.filter((s) => categories.includes(s.category as ServiceCategory));

  const snapshot = {
    overall,
    label: om.label,
    emoji: om.emoji,
    text: om.text,
    updatedAt: timeAgo(new Date()),
  };

  return (
    <>
      <PageHeader title="System Status" description="Real-time health of the Ur Gay Now platform and any active incidents." />

      <Container className="space-y-16 py-12">
        {/* Overall banner */}
        <section className="rounded-3xl border-2 border-zinc-200 p-8 text-center dark:border-zinc-800">
          <StatusAutoRefresh initial={snapshot} />
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            This page updates automatically. Subscribe below to get notified of incidents.
          </p>
        </section>

        {/* Active incidents */}
        {activeIncidents.length > 0 && (
          <Section title="Active Incidents">
            <div className="space-y-4">
              {activeIncidents.map((i) => {
                const meta = INCIDENT_STATUS_META[i.status as IncidentStatus];
                return (
                  <div key={i.id} id={`incident-${i.id}`} className="rounded-2xl border-2 border-zinc-200 p-6 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                      <span className={`font-semibold ${meta.text}`}>{meta.label}</span>
                      <span className="ml-auto text-sm text-zinc-400">{timeAgo(i.createdAt)}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">{i.title}</h3>
                    {i.description && (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{i.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Active maintenance */}
        {activeMaintenance.length > 0 && (
          <Section title="Scheduled Maintenance">
            <div className="space-y-4">
              {activeMaintenance.map((m) => {
                const meta = MAINTENANCE_STATUS_META[m.status as MaintenanceStatus];
                return (
                  <div key={m.id} id={`maintenance-${m.id}`} className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-6 dark:border-sky-900 dark:bg-sky-950/40">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{meta.emoji}</span>
                      <span className={`font-semibold ${meta.text}`}>{meta.label}</span>
                      <span className="ml-auto text-sm text-zinc-400">
                        {new Date(m.startAt).toLocaleString()} → {new Date(m.endAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">{m.title}</h3>
                    {m.description && (
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{m.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Services grouped by category */}
        {(["Core", "Payments", "Platform"] as ServiceCategory[]).map((cat) => {
          const group = byCategory([cat]);
          if (group.length === 0) return null;
          return (
            <Section key={cat} title={cat === "Core" ? "Core Services" : cat}>
              <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 dark:border-zinc-800">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {group.map((s) => {
                    const meta = SERVICE_STATUS_META[s.status as ServiceStatus];
                    return (
                      <li key={s.id} className="flex items-center gap-4 px-6 py-4">
                        <span className="text-xl" aria-hidden>{meta.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-zinc-900 dark:text-white">{s.name}</p>
                          {s.description && (
                            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{s.description}</p>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${meta.text}`}>{meta.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Section>
          );
        })}

        {/* Uptime statistics */}
        <Section title="Uptime Statistics">
          <div className="grid gap-6 lg:grid-cols-3">
            {["Core", "Payments", "Platform"].map((cat) => {
              const group = byCategory([cat as ServiceCategory]).slice(0, 1);
              const svc = group[0];
              if (!svc) return null;
              return (
                <UptimeCard key={cat} serviceId={svc.id} serviceName={svc.name} />
              );
            })}
          </div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Detailed per-service uptime is available in the admin console.
          </p>
        </Section>

        {/* Incident history */}
        {pastIncidents.length > 0 && (
          <Section title="Incident History">
            <div className="space-y-3">
              {pastIncidents.map((i) => {
                const meta = INCIDENT_STATUS_META[i.status as IncidentStatus];
                return (
                  <div key={i.id} id={`incident-${i.id}`} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${meta.text}`}>{meta.label}</span>
                      <span className="text-sm text-zinc-400">{timeAgo(i.createdAt)}</span>
                    </div>
                    <p className="mt-1 font-medium text-zinc-900 dark:text-white">{i.title}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Subscribe */}
        <Section title="Get Notified">
          <StatusSubscribeForm />
        </Section>
      </Container>
    </>
  );
}

async function UptimeCard({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const windows = await safeQuery(() => computeUptime(serviceId), [
    { key: "24h", label: "Last 24 Hours", days: 1, uptimePct: 100, total: 0, up: 0 },
    { key: "7d", label: "Last 7 Days", days: 7, uptimePct: 100, total: 0, up: 0 },
    { key: "30d", label: "Last 30 Days", days: 30, uptimePct: 100, total: 0, up: 0 },
    { key: "90d", label: "Last 90 Days", days: 90, uptimePct: 100, total: 0, up: 0 },
  ] as any);
  const color = (p: number) => (p >= 99.9 ? "text-emerald-600 dark:text-emerald-400" : p >= 98 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400");
  return (
    <div className="rounded-2xl border-2 border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="font-semibold text-zinc-900 dark:text-white">{serviceName}</h3>
      <div className="mt-4 space-y-2">
        {windows.map((w: any) => (
          <div key={w.key} className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">{w.label}</span>
            <span className={`font-bold ${color(w.uptimePct)}`}>{w.uptimePct.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
