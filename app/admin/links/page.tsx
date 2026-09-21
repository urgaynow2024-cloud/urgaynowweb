import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteLink } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconLink, IconPlus, IconSearch, IconEdit, IconStar, IconEye, IconEyeOff } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LINK_CATEGORY_LABELS } from "@/lib/links";

export const metadata = { title: "Links", robots: { index: false, follow: false } };

export default async function AdminLinksList({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  let items: Awaited<ReturnType<typeof prisma.link.findMany>> = [];
  try {
    items = await prisma.link.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { label: { contains: q, mode: "insensitive" } },
                { url: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
    });
  } catch (e) {
    console.error("Failed to load links:", e);
  }

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Links" }]}
        title="Links"
        description="Manage external link destinations for the public links hub."
        actions={
          <Link href="/admin/links/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add link
          </Link>
        }
      />

      <Card className="animate-fade-in">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by label, URL, or description…" className="input pl-9" />
          </div>
          {q && (
            <Link href="/admin/links" className="btn-ghost btn-sm">
              Clear
            </Link>
          )}
        </form>

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconLink size={28} />}
              title={q ? "No links match your search" : "No links yet"}
              description={q ? "Try a different search or clear the filters." : "Add your first external link to build the hub."}
              action={!q ? <Link href="/admin/links/new" className="btn-primary"><IconPlus size={16} /> Add link</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                  <th className="px-5 py-3">Label</th>
                  <th className="hidden px-5 py-3 sm:table-cell">URL</th>
                  <th className="hidden px-5 py-3 md:table-cell">Category</th>
                  <th className="hidden px-5 py-3 md:table-cell">Active</th>
                  <th className="hidden px-5 py-3 md:table-cell">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((l) => (
                  <tr key={l.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {l.icon && <span className="text-base">{l.icon}</span>}
                        <span className="font-medium text-ink-900 dark:text-white">{l.label}</span>
                        {l.featured && (
                          <span title="Featured" aria-label="Featured">
                            <IconStar size={12} className="text-amber-400" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <span className="truncate text-ink-500" title={l.url}>{l.url}</span>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <span className="text-ink-600 dark:text-ink-300">{LINK_CATEGORY_LABELS[l.category] ?? l.category}</span>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      {l.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><IconEye size={14} /> Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink-400"><IconEyeOff size={14} /> Inactive</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell text-ink-400">{l.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/links/${l.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={() => deleteLink(l.id)}
                          message={`Delete "${l.label}"?`}
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
