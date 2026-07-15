import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { MAINTENANCE_STATUSES, MAINTENANCE_STATUS_META } from "@/lib/status/types";
import { createMaintenance } from "../../actions";

export const metadata = { title: "New Maintenance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function NewMaintenancePage() {
  await requireAdmin();
  const services = await safeQuery(() => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }), [] as any[]);
  const now = new Date();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Status", href: "/admin/status" },
          { label: "Maintenance", href: "/admin/status/maintenance" },
          { label: "New" },
        ]}
        title="New Maintenance Window"
        description="Schedule a maintenance window and notify subscribers."
      />
      <Card>
        <form action={createMaintenance as any} className="space-y-5 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input name="title" required className="input" placeholder="e.g. Database upgrade" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} className="input" placeholder="What is being done and expected impact" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start</label>
              <input type="datetime-local" name="startAt" required defaultValue={toLocalInput(now)} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Expected end</label>
              <input type="datetime-local" name="endAt" required defaultValue={toLocalInput(new Date(now.getTime() + 3600_000))} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select name="status" className="select" defaultValue="scheduled">
                {MAINTENANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>{MAINTENANCE_STATUS_META[s].label}</option>
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
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Schedule</button>
            <Link href="/admin/status/maintenance" className="btn-ghost">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
