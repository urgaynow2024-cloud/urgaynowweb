import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteEvent } from "./actions";
import { formatDateTime } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge, StatusPill } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconCalendar, IconPlus, IconSearch, IconEdit, IconFilter } from "@/components/admin/ui/icons";

export const metadata = { title: "Events", robots: { index: false, follow: false } };

export default async function AdminEventsList({
  searchParams,
}: {
  searchParams: { q?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";

  let items: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    items = await prisma.event.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { startDateTime: "desc" },
    });
  } catch (e) {
    console.error("Failed to load events:", e);
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Events" }]}
        title="Events"
        description="Manage dates, locations, and registration details."
        actions={
          <Link href="/admin/events/new" className="btn-primary btn-sm">
            <IconPlus size={16} /> Add event
          </Link>
        }
      />

      <Card className="animate-fade-in overflow-visible">
        <form method="get" className="flex flex-col gap-3 border-b border-ink-100 p-4 dark:border-ink-800 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input name="q" defaultValue={q} placeholder="Search by title or location…" className="input pl-9" />
          </div>
          {(q) && (
            <Link href="/admin/events" className="btn-ghost btn-sm">Clear</Link>
          )}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — please check the form and try again.
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconCalendar size={28} />}
              title={q ? "No events match your search" : "No events yet"}
              description={q ? "Try a different search or clear the filters." : "Add your first event to get started."}
              action={!q ? <Link href="/admin/events/new" className="btn-primary"><IconPlus size={16} /> Add event</Link> : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-ink-50/80 text-xs uppercase tracking-wide text-ink-500 backdrop-blur dark:bg-ink-800/80">
                <tr>
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="hidden px-5 py-3 font-semibold lg:table-cell">Location</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((e) => (
                  <tr key={e.id} className="group transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {e.coverImage && (
                          <img src={e.coverImage} alt={e.title} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                        )}
                        <span className="font-medium text-ink-900 dark:text-white">{e.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{formatDateTime(e.startDateTime)}</td>
                    <td className="hidden px-5 py-3 lg:table-cell">{e.location || "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill tone={e.published ? "success" : "neutral"}>{e.published ? "Published" : "Draft"}</StatusPill>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/events/${e.id}`} className="btn-secondary btn-sm">
                          <IconEdit size={14} /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteEvent.bind(null, e.id)}
                          message={`Delete "${e.title}"? This cannot be undone.`}
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
