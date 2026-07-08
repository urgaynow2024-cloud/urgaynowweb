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

export function AnnouncementCard({ item }: { item: AnnouncementCardData }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5"
    >
      {item.coverImage && (
        <div className="h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverImage}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {formatDate(item.publishedAt)}
        </time>
        <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            {item.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
