import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGroupPhoto } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminGroupPhotosList() {
  const items = await prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Group & Team Photos</h1>
        <Link href="/admin/group-photos/new" className="btn-primary">+ Upload photo</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No group photos yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {(g as any).bannerUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={(g as any).bannerUrl} 
                    alt={`${g.title} banner`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={g.imageUrl} alt={g.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-900 dark:text-white">{g.title}</p>
                  {(g as any).rules && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Has rules</p>
                  )}
                </div>
                <Link href={`/admin/group-photos/${g.id}`} className="btn-secondary text-sm">Edit</Link>
                <ConfirmDeleteButton
                  action={deleteGroupPhoto.bind(null, g.id)}
                  message="Delete this photo?"
                  label="Delete"
                  className="btn-danger text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
