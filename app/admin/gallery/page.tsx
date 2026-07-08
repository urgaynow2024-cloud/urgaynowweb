import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteGalleryImage } from "./actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminGalleryList() {
  const items = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Gallery</h1>
        <Link href="/admin/gallery/new" className="btn-primary">+ Add image</Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No gallery images yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.imageUrl} alt={g.title} className="aspect-square w-full object-cover" />
              <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-900 dark:text-white">{g.title}</p>
                </div>
                <Link href={`/admin/gallery/${g.id}`} className="btn-secondary text-sm">Edit</Link>
                <ConfirmDeleteButton
                  action={deleteGalleryImage.bind(null, g.id)}
                  message="Delete this image?"
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
