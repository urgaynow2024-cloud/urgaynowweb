import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { IconPlus, IconMegaphone } from "@/components/admin/ui/icons";
import { INCIDENT_STATUS_META, INCIDENT_IMPACT_META, isActiveIncident } from "@/lib/status/types";
import type { Incident, IncidentStatus, IncidentImpact } from "@/lib/status/types";

export const metadata = { title: "Incidents", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminIncidentsPage() {
  await requireAdmin();
  const incidents = await safeQuery(
    () => prisma.incident.findMany({ orderBy: { createdAt: "desc" } }),
    [] as Incident[],
  );
  const incidentIds = incidents.map((i) => i.id);
  const serviceLinks = incidentIds.length
    ? await safeQuery(
        () => prisma.incidentService.findMany({ where: { incidentId: { in: incidentIds } }, include: { service: true } }),
        [] as any[],
      )
    : [];
  const servicesByIncident = new Map<string, string[]>();
  for (const sl of serviceLinks) {
    const arr = servicesByIncident.get(sl.incidentId) ?? [];
    arr.push(sl.service?.name ?? sl.serviceId);
    servicesByIncident.set(sl.incidentId, arr);
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Status", href: "/admin/status" }, { label: "Incidents" }]}
        title="Incidents"
        description="Track and resolve platform incidents."
        actions={
          <Link href="/admin/status/incidents/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> New incident
          </Link>
        }
      />
      <Card>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {incidents.map((i: any) => {
                const meta = INCIDENT_STATUS_META[i.status as IncidentStatus];
                const impact = INCIDENT_IMPACT_META[i.impact as IncidentImpact];
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="text-xl" aria-hidden>{meta.emoji}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/status/incidents/${i.id}`} className="font-medium text-zinc-900 hover:text-brand-600 dark:text-white">
                    {i.title}
                  </Link>
                  <p className="text-xs text-zinc-400">
                    {meta.label} · <span className={impact.text}>Impact: {impact.label}</span> · {(servicesByIncident.get(i.id) ?? []).length} service(s)
                  </p>
                </div>
                {isActiveIncident(i.status) ? (
                  <Badge tone="warning">Active</Badge>
                ) : (
                  <Badge tone="success">Resolved</Badge>
                )}
                <span className="text-xs text-zinc-400">{new Date(i.createdAt).toLocaleDateString()}</span>
              </li>
            );
          })}
          {incidents.length === 0 && (
            <li className="p-6 text-center text-zinc-500">
              <IconMegaphone className="mx-auto mb-2" />
              No incidents yet.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

