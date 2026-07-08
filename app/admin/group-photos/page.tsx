import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGroupPhoto } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminGroupPhotosList() {
  let items: Array<{ id: string; title: string; description: string; imageUrl: string; bannerUrl?: string; rules?: string }> = [];
  let error: string | null = null;

  try {
    items = await prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" } });
  } catch (e) {
    console.error("Failed to fetch group photos:", e);
    error = "Failed to load group photos. Please try again.";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Group & Team Photos</h1>
        <Link href="/admin/group-photos/new" className="btn-primary">+ Upload photo</Link>
      </div>

      {error ? (
        <div className="card">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              No group photos yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Upload your first group photo to get started
            </p>
            <Link href="/admin/group-photos/new" className="btn-primary">
              Upload Photo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {g.bannerUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={g.bannerUrl} 
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
                  {g.rules && (
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
