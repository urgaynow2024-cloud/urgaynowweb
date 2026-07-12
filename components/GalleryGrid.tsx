import Link from "next/link";

export type GalleryImageData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isGroup?: boolean;
  groupId?: string;
};

export function GalleryGrid({ images }: { images: GalleryImageData[] }) {
  if (images.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        <p className="text-xl text-zinc-500 dark:text-zinc-400">No photos yet — check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => {
        const content = (
          <>
            <div className="aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            {(img.title || img.description) && (
              <div className="flex flex-1 flex-col p-4">
                {img.title && (
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{img.title}</p>
                )}
                {img.description && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {img.description}
                  </p>
                )}
                {img.isGroup && (
                  <p className="mt-auto pt-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                    View group →
                  </p>
                )}
              </div>
            )}
          </>
        );

        if (img.isGroup && img.groupId) {
          return (
            <Link
              key={img.id}
              href={`/groups/${img.groupId}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950"
            >
              {content}
            </Link>
          );
        }

        return (
          <figure
            key={img.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950"
          >
            {content}
          </figure>
        );
      })}
    </div>
  );
}
