import Link from "next/link";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { MAINTENANCE_STATUS_META } from "@/lib/status/types";
import { addMaintenanceUpdate } from "../../actions";

export const metadata = { title: "Maintenance", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MaintenanceDetail({ params }: { params: { id: string } }) {
  await requireAdmin();
  const m = await safeQuery(
    () =>
      prisma.maintenance.findUnique({
        where: { id: params.id },
        include: { services: { include: { service: true } }, updates: { orderBy: { createdAt: "asc" } } },
      }),
    null,
  );

  if (!m) {
    return (
      <div>
        <PageHeader title="Maintenance not found" />
        <Card><p className="p-5 text-zinc-500">This window no longer exists. <Link href="/admin/status/maintenance" className="text-brand-600">Back</Link></p></Card>
      </div>
    );
  }

  const meta = MAINTENANCE_STATUS_META[m.status as keyof typeof MAINTENANCE_STATUS_META];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Status", href: "/admin/status" },
          { label: "Maintenance", href: "/admin/status/maintenance" },
          { label: m.title },
        ]}
        title={m.title}
        description={`${new Date(m.startAt).toLocaleString()} → ${new Date(m.endAt).toLocaleString()}`}
        actions={<Badge tone={m.status === "completed" ? "success" : "warning"}>{meta.label}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800"><h2 className="font-semibold">Progress updates</h2></div>
            <ol className="space-y-4 p-5">
              {m.updates.map((u: any) => (
                <li key={u.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                  <p className="text-xs text-zinc-400">{new Date(u.createdAt).toLocaleString()}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{u.message}</p>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800"><h2 className="font-semibold">Post update</h2></div>
            <form action={addMaintenanceUpdate as any} className="space-y-4 p-5">
              <input type="hidden" name="id" value={m.id} />
              <textarea name="message" rows={3} required className="input" placeholder="Progress note" />
              <button type="submit" className="btn-primary">Post update</button>
            </form>
          </Card>
        </div>
        <div>
          <Card>
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800"><h3 className="font-semibold">Affected services</h3></div>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {m.services.map((s: any) => (
                <li key={s.id} className="px-5 py-3 text-sm">{s.service?.name ?? s.serviceId}</li>
              ))}
              {m.services.length === 0 && <li className="px-5 py-3 text-sm text-zinc-500">None selected</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
