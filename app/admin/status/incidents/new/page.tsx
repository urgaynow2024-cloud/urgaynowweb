import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { IconChevronRight } from "@/components/admin/ui/icons";
import { INCIDENT_STATUSES, INCIDENT_STATUS_META, INCIDENT_IMPACT_META, type IncidentImpact } from "@/lib/status/types";
import { createIncident } from "../../actions";
import { IncidentForm } from "@/components/admin/status/IncidentForm";

export const metadata = { title: "New Incident", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewIncidentPage() {
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
          { label: "Incidents", href: "/admin/status/incidents" },
          { label: "New" },
        ]}
        title="New Incident"
        description="Open a new incident, select affected services, and preview before publishing."
      />
      <IncidentForm
        services={(services as any[]).map((s) => ({ id: s.id, name: s.name }))}
        action={createIncident}
      />
    </div>
  );
}
