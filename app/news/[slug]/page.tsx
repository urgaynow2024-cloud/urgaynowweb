import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } });
  if (!item) return { title: "Announcement not found" };
  return { title: item.title, description: item.excerpt };
}

export default async function AnnouncementPage({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } });
  if (!item || !item.published) notFound();

  return (
    <article>
      {item.coverImage && (
        <div className="relative h-56 w-full overflow-hidden bg-ink-100 dark:bg-ink-800 sm:h-80 lg:h-96">
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-ink-950/10 to-transparent" />
        </div>
      )}
      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="animate-fade-in">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            ← Back to news
          </Link>
          <time className="mt-6 block text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {formatDate(item.publishedAt)}
          </time>
          <h1 className="mt-2 text-balance text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            {item.title}
          </h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-700" />
          <div className="mt-8 border-t border-ink-200/80 pt-8 dark:border-ink-800/80">
            <Markdown content={item.content} />
          </div>
        </div>
      </Container>
    </article>
  );
}
