import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGuide } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminGuidesList() {
  const items = await prisma.guide.findMany({ orderBy: [{ sortOrder: "asc" }, { question: "asc" }] });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Guides & FAQ</h1>
        <Link href="/admin/guides/new" className="btn-primary">+ Add guide</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No guides yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((g) => (
            <li key={g.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900 dark:text-white">{g.question}</p>
                <p className="text-sm text-zinc-500">{g.category}</p>
              </div>
              <Link href={`/admin/guides/${g.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteGuide.bind(null, g.id)}
                message="Delete this guide?"
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
