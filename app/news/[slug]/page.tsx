import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";
import { normalizeRoleKey } from "@/lib/roles";
import { RoleBadge } from "@/components/RoleBadge";
import { ReportButton } from "@/components/report/ReportModal";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } });
  if (!item) return { title: "Announcement not found" };
  return { title: item.title, description: item.excerpt };
}

export default async function AnnouncementPage({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { id: true, name: true, vrchatUsername: true, rank: true } } },
  });
  if (!item || item.state !== "PUBLISHED") notFound();

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
            {item.publishedAt ? formatDate(item.publishedAt) : "—"}
          </time>
          <h1 className="mt-2 text-balance text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
            {item.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-700" />
            <ReportButton contentType="ANNOUNCEMENT" contentId={item.id} contentTitle={item.title} size="sm" variant="outline" className="rounded-full border-ink-300 text-ink-700 hover:bg-ink-100 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-800" />
          </div>
          {item.author && (
            <div className="mt-6 flex items-center gap-3">
              <Link href={`/staff/${item.author.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  {item.author.name?.[0] ?? "?"}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink-900 dark:text-white">{item.author.name}</span>
                  <span className="text-xs text-ink-500 dark:text-ink-400">@{item.author.vrchatUsername}</span>
                </div>
              </Link>
              <RoleBadge role={normalizeRoleKey(item.author.rank)} />
            </div>
          )}
          <div className="mt-8 border-t border-ink-200/80 pt-8 dark:border-ink-800/80">
            <Markdown content={item.content} />
          </div>
        </div>
      </Container>
    </article>
  );
}
