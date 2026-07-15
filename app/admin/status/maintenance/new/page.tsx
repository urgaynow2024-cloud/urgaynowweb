import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { MAINTENANCE_STATUSES, MAINTENANCE_STATUS_META } from "@/lib/status/types";
import { createMaintenance } from "../../actions";
import { MaintenanceForm } from "@/components/admin/status/MaintenanceForm";

export const metadata = { title: "New Maintenance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewMaintenancePage() {
  await requireAdmin();
  const services = await safeQuery(
    () => prisma.statusService.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    [] as any[],
  );

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
        description="Schedule a maintenance window, select affected services, and preview before publishing."
      />
      <MaintenanceForm
        services={(services as any[]).map((s) => ({ id: s.id, name: s.name }))}
        action={createMaintenance}
      />
    </div>
  );
}
