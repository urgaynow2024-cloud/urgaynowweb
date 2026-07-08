export type GalleryImageData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export function GalleryGrid({ images }: { images: GalleryImageData[] }) {
  if (images.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
        No photos yet — check back soon!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => (
        <figure
          key={img.id}
          className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="aspect-square overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          {(img.title || img.description) && (
            <figcaption className="p-3">
              {img.title && (
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{img.title}</p>
              )}
              {img.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {img.description}
                </p>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
