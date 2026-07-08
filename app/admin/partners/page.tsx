import Link from "next/link";
import { prisma } from "@/lib/db";
import { deletePartner } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconLink, IconPlus, IconSearch, IconEdit, IconFilter } from "@/components/admin/ui/icons";

export const metadata = { title: "Partners", robots: { index: false, follow: false } };

export default async function AdminPartnersList({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const tag = searchParams.tag?.trim() || "";

  let partners: Awaited<ReturnType<typeof prisma.partner.findMany>> = [];
  try {
    partners = await prisma.partner.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(tag ? { tag } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.error("Failed to load partners:", e);
  }

  const tags = Array.from(new Set(partners.map((p) => p.tag).filter(Boolean)));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Partners" }]}
        title="Partners"
        description="Manage communities, groups, and creators connected with UGN."
        actions={
          <Link href="/admin/partners/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add partner
          </Link>
        }
      />

      <Card className="overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by name…" className="input pl-9" />
          </div>
          <div className="relative">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="tag" defaultValue={tag} className="select pl-9 pr-9">
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {(q || tag) && (
            <Link href="/admin/partners" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — please check the details and try again.
          </div>
        )}

        {partners.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconLink size={28} />}
              title={q || tag ? "No partners match your search" : "No partners yet"}
              description={q || tag ? "Try a different search or clear the filters." : "Add your first partner or affiliate to get started."}
              action={!q && !tag ? <Link href="/admin/partners/new" className="btn-primary"><IconPlus size={16} /> Add partner</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Partner</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Tag</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {partners.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logoUrl} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
                            {p.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span className="font-medium text-ink-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <Badge tone="brand">{p.tag}</Badge>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-400 md:table-cell">{p.sortOrder}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/partners/${p.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deletePartner.bind(null, p.id)}
                          message={`Delete ${p.name}? This cannot be undone.`}
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
