import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteLink } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconLink, IconPlus, IconSearch, IconEdit, IconExternal } from "@/components/admin/ui/icons";

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
        ...(q ? { OR: [{ label: { contains: q, mode: "insensitive" } }, { url: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    console.error("Failed to load links:", e);
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Links" }]}
        title="Links"
        description="Manage external links and quick-access buttons."
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
            <input name="q" defaultValue={q} placeholder="Search by label or URL…" className="input pl-9" />
          </div>
          {q && (
            <Link href="/admin/links" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconLink size={28} />}
              title={q ? "No links match your search" : "No links yet"}
              description={q ? "Try a different search or clear the filters." : "Add your first external link to get started."}
              action={!q ? <Link href="/admin/links/new" className="btn-primary"><IconPlus size={16} /> Add link</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Label</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">URL</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Order</th>
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
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <span className="truncate text-ink-500">{l.url}</span>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-400 md:table-cell">{l.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/links/${l.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteLink.bind(null, l.id)}
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
    </div>
  );
}
