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

export function AnnouncementCard({ item }: { item: AnnouncementCardData }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950"
    >
      {item.coverImage && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {item.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
