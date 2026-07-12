"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { IconStar, IconChevronLeft, IconChevronRight, IconX } from "@/components/admin/ui/icons";

export type ShopDesignPublic = {
  id: string;
  name: string;
  description: string | null;
  creator: string | null;
  category: string | null;
  imageUrl: string;
  imageAlt: string | null;
  galleryUrls: string[];
  featured: boolean;
};

type Lightbox = { images: string[]; alt: string | null; index: number } | null;

export function ShopGallery({ designs }: { designs: ShopDesignPublic[] }) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    designs.forEach((d) => d.category && set.add(d.category));
    return Array.from(set).sort();
  }, [designs]);

  const visible = useMemo(() => {
    const sorted = [...designs].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return 0;
    });
    if (filter === "all") return sorted;
    return sorted.filter((d) => d.category === filter);
  }, [designs, filter]);

  const openLightbox = useCallback((d: ShopDesignPublic, startIndex: number) => {
    const images = [d.imageUrl, ...d.galleryUrls];
    setLightbox({ images, alt: d.imageAlt, index: startIndex });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: number) => {
      setLightbox((lb) => {
        if (!lb) return lb;
        const len = lb.images.length;
        return { ...lb, index: (lb.index + dir + len) % len };
      });
    },
    [],
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, closeLightbox, step]);

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === "all"
                ? "bg-brand-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-brand-300 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600 dark:hover:text-brand-200"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === c
                  ? "bg-brand-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-brand-300 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-600 dark:hover:text-brand-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
          No designs in this category yet — check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((d) => {
            const hasGallery = d.galleryUrls.length > 0;
            return (
              <article
                key={d.id}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-zinc-900 dark:focus-visible:ring-offset-ink-950 ${
                  d.featured
                    ? "border-brand-300 dark:border-brand-700"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openLightbox(d, 0)}
                  className="relative block aspect-square overflow-hidden bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-ink-800"
                  aria-label={`View ${d.name} images`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.imageUrl}
                    alt={d.imageAlt || d.name}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <span className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      Coming Soon
                    </span>
                    {d.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pride-gradient px-2.5 py-1 text-[11px] font-semibold text-white">
                        <IconStar size={11} /> Featured
                      </span>
                    )}
                  </span>
                  {hasGallery && (
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] font-medium text-white">
                      +{d.galleryUrls.length} photos
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{d.name}</h3>
                  </div>
                  {d.category && (
                    <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
                      {d.category}
                    </p>
                  )}
                  {d.creator && (
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      by {d.creator}
                    </p>
                  )}
                  {d.description && (
                    <p className="mt-2.5 line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">{d.description}</p>
                  )}

                  {hasGallery && (
                    <div className="mt-4 flex gap-1.5 overflow-x-auto">
                      {d.galleryUrls.slice(0, 5).map((g, i) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => openLightbox(d, i + 1)}
                          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          aria-label={`View image ${i + 1} of ${d.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={g} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close preview"
          >
            <IconX size={20} />
          </button>

          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Previous image"
            >
              <IconChevronLeft size={22} />
            </button>
          )}

          <figure className="max-h-[88vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.images[lightbox.index]}
              alt={lightbox.alt || "Shop design image"}
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            {lightbox.images.length > 1 && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {lightbox.index + 1} / {lightbox.images.length}
              </figcaption>
            )}
          </figure>

          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Next image"
            >
              <IconChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
