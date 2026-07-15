import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { IconChevronRight } from "@/components/admin/ui/icons";
import {
  INCIDENT_STATUS_META,
  INCIDENT_IMPACT_META,
  INCIDENT_STATUSES,
} from "@/lib/status/types";
import { addIncidentUpdate } from "../../actions";

export const metadata = { title: "Incident", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function IncidentDetail({ params }: { params: { id: string } }) {
  await requireAdmin();
  const incident = await safeQuery(
    () =>
      prisma.incident.findUnique({
        where: { id: params.id },
        include: { services: { include: { service: true } }, updates: { orderBy: { createdAt: "asc" } } },
      }),
    null,
  );

  if (!incident) {
    return (
      <div>
        <PageHeader title="Incident not found" />
        <Card><p className="p-5 text-zinc-500">This incident no longer exists. <Link href="/admin/status/incidents" className="text-brand-600">Back</Link></p></Card>
      </div>
    );
  }

  const meta = INCIDENT_STATUS_META[incident.status as keyof typeof INCIDENT_STATUS_META];
  const impact = INCIDENT_IMPACT_META[incident.impact as keyof typeof INCIDENT_IMPACT_META];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Status", href: "/admin/status" },
          { label: "Incidents", href: "/admin/status/incidents" },
          { label: incident.title },
        ]}
        title={incident.title}
        description={meta.label}
        actions={<Badge tone={incident.status === "resolved" ? "success" : "warning"}>{meta.label}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Timeline</h2>
            </div>
            <ol className="space-y-4 p-5">
              {incident.updates.map((u: any, idx: number) => {
                const um = INCIDENT_STATUS_META[u.status as keyof typeof INCIDENT_STATUS_META];
                return (
                  <li key={u.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${um.text}`}>{um.label}</span>
                      <span className="text-xs text-zinc-400">{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{u.message}</p>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* New update */}
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Post update</h2>
            </div>
            <form action={addIncidentUpdate as any} className="space-y-4 p-5">
              <input type="hidden" name="id" value={incident.id} />
              <textarea name="message" rows={3} required className="input" placeholder="Progress or resolution note" />
              <div className="flex flex-wrap items-center gap-3">
                <select name="status" defaultValue={incident.status} className="select">
                  {INCIDENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{INCIDENT_STATUS_META[s].label}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary">Post update</button>
                {incident.status !== "resolved" && (
                  <span className="text-xs text-zinc-400">Set status to “Resolved” above to close the incident.</span>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Impact</span><span className={impact.text}>{impact.label}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Opened</span><span>{new Date(incident.createdAt).toLocaleString()}</span></div>
              {incident.resolvedAt && (
                <div className="flex justify-between"><span className="text-zinc-500">Resolved</span><span>{new Date(incident.resolvedAt).toLocaleString()}</span></div>
              )}
            </div>
          </Card>
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800"><h3 className="font-semibold">Affected services</h3></div>
            <ul className="divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
              {incident.services.map((s: any) => (
                <li key={s.id} className="px-5 py-3 text-sm">{s.service?.name ?? s.serviceId}</li>
              ))}
              {incident.services.length === 0 && <li className="px-5 py-3 text-sm text-zinc-500">None selected</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
