import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteStaff } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconUsers, IconPlus, IconSearch, IconEdit, IconFilter } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Staff", robots: { index: false, follow: false } };

export default async function AdminStaffList({
  searchParams,
}: {
  searchParams: { q?: string; rank?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const rank = searchParams.rank?.trim() || "";

  let staff: Awaited<ReturnType<typeof prisma.staff.findMany>> = [];
  try {
    staff = await prisma.staff.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { vrchatUsername: { contains: q, mode: "insensitive" } }] } : {}),
        ...(rank ? { rank } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.error("Failed to load staff:", e);
  }

  const ranks = Array.from(new Set(staff.map((s) => s.rank).filter(Boolean)));

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Staff" }]}
        title="Staff"
        description="Manage your team directory, roles, and bios."
        actions={
          <Link href="/admin/staff/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add staff
          </Link>
        }
      />

      <Card className="overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by name or VRChat username…" className="input pl-9" />
          </div>
          <div className="relative">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="rank" defaultValue={rank} className="select pl-9 pr-9">
              <option value="">All ranks</option>
              {ranks.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {(q || rank) && (
            <Link href="/admin/staff" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — the VRChat username may already be in use. Try a different one.
          </div>
        )}

        {staff.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconUsers size={28} />}
              title={q || rank ? "No staff match your search" : "No staff yet"}
              description={q || rank ? "Try a different search or clear the filters." : "Add your first team member to get started."}
              action={!q && !rank ? <Link href="/admin/staff/new" className="btn-primary"><IconPlus size={16} /> Add staff</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">VRChat</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Rank</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {staff.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.photoUrl} name={s.name} size="sm" />
                        <span className="font-medium text-ink-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-500">@{s.vrchatUsername}</td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <Badge tone={s.rank ? "brand" : "neutral"}>{s.rank || "Member"}</Badge>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-400 md:table-cell">{s.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/staff/${s.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteStaff.bind(null, s.id)}
                          message={`Delete ${s.name}? This cannot be undone.`}
                          label="Delete"
                          className="btn-danger btn-sm"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
