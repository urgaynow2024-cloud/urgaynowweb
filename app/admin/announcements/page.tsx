import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteAnnouncement, importFromDiscord } from "./actions";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge, StatusPill } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconMegaphone, IconPlus, IconSearch, IconEdit, IconFilter, IconDownload } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Announcements", robots: { index: false, follow: false } };

export default async function AdminAnnouncementsList({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; error?: string; imported?: string; importError?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status?.trim() || "";

  let items: Awaited<ReturnType<typeof prisma.announcement.findMany>> = [];
  try {
    items = await prisma.announcement.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { excerpt: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status === "published" ? { published: true } : status === "drafts" ? { published: false } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to load announcements:", e);
  }

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Announcements" }]}
        title="Announcements"
        description="Manage posts, updates, and news for your community."
        actions={
          <>
            <form action={importFromDiscord}>
              <button type="submit" className="btn-secondary btn-sm">
                <IconDownload size={16} /> Sync from Discord
              </button>
            </form>
            <Link href="/admin/announcements/new" className="btn-primary btn-sm">
              <IconPlus size={16} /> Add announcement
            </Link>
          </>
        }
      />

      <Card className="animate-fade-in overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title or excerpt…" className="input pl-9" />
          </div>
          <div className="relative">
            <IconFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <select name="status" defaultValue={status} className="select pl-9 pr-9">
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="drafts">Drafts</option>
            </select>
          </div>
          {(q || status) && (
            <Link href="/admin/announcements" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — the slug may already be in use. Use a different title or slug.
          </div>
        )}

        {searchParams.imported !== undefined && (
          <div role="status" className="m-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            Synced the latest Discord announcement. The previous one was replaced to save space.
          </div>
        )}

        {searchParams.importError && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Discord import failed: {decodeURIComponent(searchParams.importError)}
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconMegaphone size={28} />}
              title={q || status ? "No announcements match your search" : "No announcements yet"}
              description={q || status ? "Try a different search or clear the filters." : "Add your first post to keep players informed."}
              action={!q && !status ? <Link href="/admin/announcements/new" className="btn-primary"><IconPlus size={16} /> Add announcement</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Excerpt</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((a) => (
                  <tr key={a.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                      {a.coverImage && (
                        <Image src={a.coverImage} alt={a.title} width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      )}
                        <span className="font-medium text-ink-900 dark:text-white">{a.title}</span>
                      </div>
                    </td>
                    <td className="hidden max-w-[280px] truncate px-5 py-3 text-ink-500 sm:table-cell">{a.excerpt}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={a.published ? "success" : "neutral"}>{a.published ? "Published" : "Draft"}</StatusPill>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-500 md:table-cell">{formatDate(a.publishedAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/announcements/${a.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteAnnouncement.bind(null, a.id)}
                          message={`Delete "${a.title}"? This cannot be undone.`}
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
