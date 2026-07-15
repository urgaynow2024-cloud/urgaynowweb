import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { IconPlus, IconCalendar } from "@/components/admin/ui/icons";
import { MAINTENANCE_STATUS_META, isActiveMaintenance } from "@/lib/status/types";
import type { Maintenance, MaintenanceStatus } from "@/lib/status/types";

export const metadata = { title: "Maintenance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  await requireAdmin();
  const items = await safeQuery(
    () => prisma.maintenance.findMany({ orderBy: { startAt: "desc" } }),
    [] as Maintenance[],
  );
  const ids = items.map((m) => m.id);
  const links = ids.length
    ? await safeQuery(
        () => prisma.maintenanceService.findMany({ where: { maintenanceId: { in: ids } }, include: { service: true } }),
        [] as any[],
      )
    : [];
  const servicesByM = new Map<string, number>();
  for (const l of links) servicesByM.set(l.maintenanceId, (servicesByM.get(l.maintenanceId) ?? 0) + 1);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Status", href: "/admin/status" }, { label: "Maintenance" }]}
        title="Scheduled Maintenance"
        description="Announce and track maintenance windows."
        actions={
          <Link href="/admin/status/maintenance/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> New
          </Link>
        }
      />
      <Card>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map((m: any) => {
                const meta = MAINTENANCE_STATUS_META[m.status as MaintenanceStatus];
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                <span className="text-xl" aria-hidden>{meta.emoji}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/status/maintenance/${m.id}`} className="font-medium text-zinc-900 hover:text-brand-600 dark:text-white">
                    {m.title}
                  </Link>
                  <p className="text-xs text-zinc-400">
                    {new Date(m.startAt).toLocaleString()} → {new Date(m.endAt).toLocaleString()}
                  </p>
                </div>
                <Badge tone={isActiveMaintenance(m.status) ? "warning" : "success"}>{meta.label}</Badge>
                <span className="text-xs text-zinc-400">{(servicesByM.get(m.id) ?? 0)} service(s)</span>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="p-6 text-center text-zinc-500">
              <IconCalendar className="mx-auto mb-2" /> No maintenance scheduled.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
