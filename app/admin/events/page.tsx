import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { archiveEvent, deleteEvent, restoreEvent, setEventPublished } from "./actions";
import { formatEventDateTime, getEventState, getEventStateClasses } from "@/lib/event-utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { IconCalendar, IconPlus, IconSearch, IconEdit, IconEye, IconEyeOff } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Events", robots: { index: false, follow: false } };

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "LIVE", label: "Live Now" },
  { value: "PAST", label: "Past" },
  { value: "ARCHIVED", label: "Archived" },
];

export default async function AdminEventsList({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; error?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status || "";

  let items: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    items = await prisma.event.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
                { hostName: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { startDateTime: "desc" },
    });
  } catch (e) {
    console.error("Failed to load events:", e);
  }

  const filtered = status ? items.filter((event) => getEventState(event) === status) : items;

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Events" }]}
        title="Events"
        description="Manage dates, locations, visibility, and event lifecycle."
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
            <input name="q" defaultValue={q} placeholder="Search by title, host, category, or location…" className="input pl-9" />
          </div>
          <select name="status" defaultValue={status} className="select sm:w-40">
            {statusOptions.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
          </select>
          {(q || status) && <Link href="/admin/events" className="btn-ghost btn-sm">Clear</Link>}
        </form>

        {searchParams.error && (
          <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Could not save — please check the form and try again.
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<IconCalendar size={28} />}
              title={q || status ? "No events match your filters" : "No events yet"}
              description={q || status ? "Try a different search or clear the filters." : "Add your first event to get started."}
              action={!q && !status ? <Link href="/admin/events/new" className="btn-primary"><IconPlus size={16} /> Add event</Link> : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const state = getEventState(e);
              const isArchived = state === "ARCHIVED";
              return (
                <Card key={e.id} className="flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div className="relative aspect-[16/9] overflow-hidden bg-ink-100 dark:bg-ink-800">
                    {e.coverImage ? (
                      <Image src={e.coverImage} alt={e.title} fill className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-400">
                        <IconCalendar size={28} />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 flex gap-2">
                      <Badge tone={e.published ? "success" : "neutral"}>{e.published ? "Published" : "Draft"}</Badge>
                      <span className={`badge ${getEventStateClasses(state)}`}>{state === "LIVE" ? "Live Now" : state === "UPCOMING" ? "Upcoming" : state === "ARCHIVED" ? "Archived" : "Past"}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold text-ink-900 dark:text-white">{e.title}</h3>
                    <p className="mt-1 text-xs text-ink-500">{formatEventDateTime(e.startDateTime, e.timezone)}</p>
                    {(e.hostName || e.category) && <p className="mt-1 text-xs text-ink-500">{[e.hostName, e.category].filter(Boolean).join(" • ")}</p>}
                    {e.location && <p className="mt-1 text-xs text-ink-500">{e.location}</p>}
                    {e.description && (
                      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300 line-clamp-2">{e.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                      <form action={() => setEventPublished(e.id, !e.published)}>
                        <button type="submit" className="btn-secondary btn-sm">
                          {e.published ? <IconEyeOff size={14} /> : <IconEye size={14} />} {e.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <Link href={`/admin/events/${e.id}`} className="btn-secondary btn-sm">
                        <IconEdit size={14} /> Edit
                      </Link>
                      {isArchived ? (
                        <form action={() => restoreEvent(e.id)}>
                          <button type="submit" className="btn-secondary btn-sm"><IconEye size={14} /> Restore</button>
                        </form>
                      ) : (
                        <form action={() => archiveEvent(e.id)}>
                          <button type="submit" className="btn-secondary btn-sm"><IconEyeOff size={14} /> Archive</button>
                        </form>
                      )}
                      <ConfirmDeleteButton
                        action={() => deleteEvent(e.id)}
                        message={`Delete "${e.title}"? This cannot be undone.`}
                        label="Delete"
                        className="btn-danger btn-sm"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}
