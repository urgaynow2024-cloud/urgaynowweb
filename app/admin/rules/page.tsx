import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteRule } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminRulesList() {
  const items = await prisma.rule.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Rules</h1>
        <Link href="/admin/rules/new" className="btn-primary">+ Add rule</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No rules yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((r) => (
            <li key={r.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white">{r.title}</p>
                <p className="text-sm text-zinc-500">{r.category}</p>
              </div>
              <Link href={`/admin/rules/${r.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteRule.bind(null, r.id)}
                message={`Delete “${r.title}”?`}
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
