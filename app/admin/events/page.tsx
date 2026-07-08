import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteEvent } from "./actions";
import { formatDateTime } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconCalendar, IconPlus, IconSearch, IconEdit } from "@/components/admin/ui/icons";

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <Card key={e.id} className="flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="relative aspect-[16/9] overflow-hidden bg-ink-100 dark:bg-ink-800">
                  {e.coverImage ? (
                    <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-400">
                      <IconCalendar size={28} />
                    </div>
                  )}
                  <div className="absolute left-2 top-2">
                    <Badge tone={e.published ? "success" : "neutral"}>{e.published ? "Published" : "Draft"}</Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-semibold text-ink-900 dark:text-white">{e.title}</h3>
                  <p className="mt-1 text-xs text-ink-500">{formatDateTime(e.startDateTime)}</p>
                  {e.location && <p className="mt-1 text-xs text-ink-500">{e.location}</p>}
                  {e.description && (
                    <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{e.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-end gap-2 pt-4">
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
