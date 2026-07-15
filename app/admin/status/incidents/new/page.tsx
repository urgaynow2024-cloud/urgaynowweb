import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { IconChevronRight } from "@/components/admin/ui/icons";
import { INCIDENT_STATUSES, INCIDENT_STATUS_META, INCIDENT_IMPACT_META, type IncidentImpact } from "@/lib/status/types";
import { createIncident } from "../../actions";

export const metadata = { title: "New Incident", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewIncidentPage() {
  await requireAdmin();
  const services = await safeQuery(() => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }), [] as any[]);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Status", href: "/admin/status" },
          { label: "Incidents", href: "/admin/status/incidents" },
          { label: "New" },
        ]}
        title="New Incident"
        description="Open a new incident and select affected services."
      />
      <Card>
        <form action={createIncident as any} className="space-y-5 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input name="title" required className="input" placeholder="Brief summary of the issue" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} className="input" placeholder="What users are experiencing" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Initial status</label>
              <select name="status" className="select" defaultValue="investigating">
                {INCIDENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{INCIDENT_STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Impact</label>
              <select name="impact" className="select" defaultValue="minor">
                {(Object.keys(INCIDENT_IMPACT_META) as IncidentImpact[]).map((s) => (
                  <option key={s} value={s}>{INCIDENT_IMPACT_META[s].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Affected services</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s: any) => (
                <label key={s.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                  <input type="checkbox" name="serviceIds" value={s.id} />
                  <span>{s.name}</span>
                </label>
              ))}
              {services.length === 0 && <p className="text-sm text-zinc-500">No services. Run a health check first.</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Create incident</button>
            <Link href="/admin/status/incidents" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
