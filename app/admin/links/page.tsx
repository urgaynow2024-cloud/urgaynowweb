import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteLink } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminLinksList() {
  const items = await prisma.link.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Links</h1>
        <Link href="/admin/links/new" className="btn-primary">+ Add link</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No links yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((l) => (
            <li key={l.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {l.icon && <span className="mr-2">{l.icon}</span>}
                  {l.label}
                </p>
                <p className="truncate text-sm text-zinc-500">{l.url}</p>
              </div>
              <Link href={`/admin/links/${l.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteLink.bind(null, l.id)}
                message={`Delete “${l.label}”?`}
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
