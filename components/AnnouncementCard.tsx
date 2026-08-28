import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export type AnnouncementCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date | string;
};

export function AnnouncementCard({
  item,
  featured = false,
}: {
  item: AnnouncementCardData;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-card-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-brand-800/30 dark:bg-ink-900/80 dark:hover:border-brand-700/50 dark:focus-visible:ring-offset-surface-950 ${
        featured ? "md:col-span-2 lg:col-span-1" : ""
      }`}
    >
      {item.coverImage && (
        <div className="relative w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
          <div
            className={`relative transition-transform duration-500 ease-spring-bounce group-hover:scale-105 ${
              featured ? "aspect-[2/1]" : "aspect-[3/2]"
            }`}
          >
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              sizes={featured ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-pride-gradient px-2.5 py-1 text-xs font-semibold text-white shadow-glow">
              ✨ Featured
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-300">
          {formatDate(item.publishedAt)}
        </time>
        <h3
          className={`mt-2 text-lg font-bold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors ${featured ? "text-xl sm:text-2xl" : ""}`}
        >
          {item.title}
        </h3>
        {item.excerpt && (
          <p
            className={`mt-2 text-sm text-ink-500 dark:text-ink-400 line-clamp-2 ${featured ? "text-lg" : ""}`}
          >
            {item.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Read more
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {featured && (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-brand-300/30 dark:border-brand-700/30 pointer-events-none" aria-hidden />
      )}
    </Link>
  );
}
