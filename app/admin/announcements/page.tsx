import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteAnnouncement } from "./actions";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminAnnouncementsList({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const items = await prisma.announcement.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Announcements</h1>
        <Link href="/admin/announcements/new" className="btn-primary">+ Add announcement</Link>
      </div>

      {searchParams.error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Could not save — the slug may already be in use. Use a different title or slug.
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No announcements yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900 dark:text-white">{a.title}</p>
                <p className="truncate text-sm text-zinc-500">
                  {formatDate(a.publishedAt)} {!a.published && "· Draft"}
                </p>
              </div>
              <Link href={`/admin/announcements/${a.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteAnnouncement.bind(null, a.id)}
                message={`Delete “${a.title}”?`}
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
