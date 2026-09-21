"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { IconChevronLeft, IconChevronRight, IconX } from "@/components/admin/ui/icons";
import { ReportButton } from "@/components/report/ReportModal";

export type GalleryImageData = {
  id: string;
  sourceType?: "SUBMISSION" | "GALLERY_IMAGE" | "GROUP_PHOTO";
  sourceId?: string;
  title: string;
  description: string;
  imageUrl: string;
  submitterName?: string;
  category?: string;
  createdAt?: string;
  href?: string;
  isGroup?: boolean;
  groupId?: string;
};

type Lightbox = { images: GalleryImageData[]; index: number } | null;

type EmptyStateContext = {
  q?: string;
  type?: string;
  total?: number;
};

export function GalleryGrid({
  images,
  emptyState,
}: {
  images: GalleryImageData[];
  emptyState?: EmptyStateContext;
}) {
  const [lightbox, setLightbox] = useState<Lightbox>(null);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

  const openLightbox = useCallback((img: GalleryImageData, idx: number) => {
    setLightbox({ images: images, index: idx });
  }, [images]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const step = useCallback((dir: number) => {
    setLightbox((lb) => {
      if (!lb) return lb;
      const len = lb.images.length;
      return { ...lb, index: (lb.index + dir + len) % len };
    });
  }, []);

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

  if (images.length === 0) {
    const ctx = emptyState ?? {};
    const title = ctx.q
      ? "Nothing matched those filters."
      : ctx.type
        ? "No photos in this category yet."
        : ctx.total === 0
          ? "The community gallery is waiting for its first approved photo."
          : "No photos to display.";
    const description = ctx.q
      ? "Try a different search or clear your filters."
      : ctx.type
        ? "Be the first to share something in this category."
        : ctx.total === 0
          ? "Submit a photo and it will appear here after a moderator reviews it."
          : "Check back soon — more content is on the way.";
    return (
      <EmptyState icon="Gallery" title={title} description={description} />
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((img, idx) => {
          const isGroupLink = img.isGroup && img.groupId;

          const content = (
            <>
              <div className="relative aspect-square w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  className={`object-cover transition-all duration-500 ease-spring-bounce ${loaded.has(img.imageUrl) ? "scale-100 opacity-100" : "scale-105 opacity-0 group-hover:scale-110"}`}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3C/svg%3E"
                  loading={idx < 8 ? "eager" : "lazy"}
                  onLoadingComplete={() => setLoaded((s) => new Set(s).add(img.imageUrl))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {(img.title || img.description) && (
                  <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 text-xs text-white/0 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white/80 group-hover:opacity-100">
                    {img.title && <span className="font-semibold">{img.title}</span>}
                  </div>
                )}
                {!isGroupLink && (
                  <div className="absolute right-2 top-2">
                    <ReportButton
                      contentType={
                        img.sourceType === "SUBMISSION"
                          ? "COMMUNITY_PHOTO"
                          : img.sourceType === "GALLERY_IMAGE"
                          ? "GALLERY_IMAGE"
                          : "GROUP_PHOTO"
                      }
                      contentId={img.sourceId || img.id}
                      contentTitle={img.title}
                      size="sm"
                      variant="ghost"
                      className="rounded-full bg-ink-950/70 text-white/90 hover:bg-ink-950/90"
                    />
                  </div>
                )}
              </div>
              {img.isGroup && (
                <div className="flex flex-1 flex-col p-4">
                  {img.title && (
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{img.title}</p>
                  )}
                  {img.description && (
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 line-clamp-2">
                      {img.description}
                    </p>
                  )}
                  <p className="mt-auto pt-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                    View group →
                  </p>
                </div>
              )}
            </>
          );

          const cardClasses =
            "group relative flex overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-200 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950";

          if (img.isGroup && img.groupId) {
            return (
              <Link
                key={img.id}
                href={`/groups/${img.groupId}`}
                className={cardClasses}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => openLightbox(img, idx)}
               className={`${cardClasses} cursor-zoom-in`}
              aria-label={`View ${img.title}`}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-xl"
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

          <figure
            className="flex max-h-[88vh] max-w-5xl flex-col overflow-hidden rounded-2xl bg-ink-950/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[80vh] overflow-hidden">
              <Image
                src={lightbox.images[lightbox.index].imageUrl}
                alt={lightbox.images[lightbox.index].title || "Gallery image"}
                width={1200}
                height={800}
                className="h-full w-full object-contain"
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3C/svg%3E"
              />
            </div>
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-white">
                    {lightbox.images[lightbox.index].title || "Untitled"}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70">
                    {lightbox.images[lightbox.index].category && (
                      <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-brand-200">
                        {lightbox.images[lightbox.index].category}
                      </span>
                    )}
                    {lightbox.images[lightbox.index].submitterName && (
                      <span>by {lightbox.images[lightbox.index].submitterName}</span>
                    )}
                    {lightbox.images[lightbox.index].createdAt && (
                      <span>· {new Date(lightbox.images[lightbox.index].createdAt!).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lightbox.images[lightbox.index].href && (
                    <Link
                      href={lightbox.images[lightbox.index].href!}
                      className="btn-secondary btn-sm"
                      onClick={closeLightbox}
                    >
                      View page
                    </Link>
                  )}
                  <a
                    href={lightbox.images[lightbox.index].imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost btn-sm"
                    aria-label="Open image in new tab"
                  >
                    Open
                  </a>
                </div>
              </div>
              {lightbox.images[lightbox.index].description && (
                <p className="text-sm text-white/70">
                  {lightbox.images[lightbox.index].description}
                </p>
              )}
              {lightbox.images.length > 1 && (
                <p className="text-xs text-white/50">
                  {lightbox.index + 1} of {lightbox.images.length}
                </p>
              )}
            </div>
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
