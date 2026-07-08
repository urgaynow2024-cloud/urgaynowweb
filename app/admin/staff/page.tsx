import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteStaff } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminStaffList({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const staff = await prisma.staff.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Staff</h1>
          <p className="text-sm text-zinc-500">{staff.length} member(s)</p>
        </div>
        <Link href="/admin/staff/new" className="btn-primary">+ Add staff</Link>
      </div>

      {searchParams.error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Could not save — the VRChat username may already be in use. Try a different one.
        </div>
      )}

      {staff.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No staff yet. Click “Add staff” to get started.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {staff.map((s) => (
            <li key={s.id} className="flex items-center gap-4 bg-white p-4 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.photoUrl || "/placeholder-avatar.svg"}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900 dark:text-white">{s.name}</p>
                <p className="truncate text-sm text-zinc-500">@{s.vrchatUsername} · {s.rank}</p>
              </div>
              <Link href={`/admin/staff/${s.id}`} className="btn-secondary text-sm">Edit</Link>
              <ConfirmDeleteButton
                action={deleteStaff.bind(null, s.id)}
                message={`Delete ${s.name}? This cannot be undone.`}
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
