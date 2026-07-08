import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteEvent } from "./actions";
import { formatDateTime } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminEventsList() {
  const items = await prisma.event.findMany({ orderBy: { startDateTime: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Events</h1>
        <Link href="/admin/events/new" className="btn-primary">+ Add event</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No events yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((e) => (
            <li key={e.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900 dark:text-white">{e.title}</p>
                <p className="truncate text-sm text-zinc-500">
                  {formatDateTime(e.startDateTime)} {!e.published && "· Draft"}
                </p>
              </div>
              <Link href={`/admin/events/${e.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteEvent.bind(null, e.id)}
                message={`Delete “${e.title}”?`}
                label="Delete"
                className="btn-danger text-sm"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
