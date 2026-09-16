import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/Container";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";
import { getUpdateTypeLabel } from "@/lib/update-utils";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const u = await prisma.update.findUnique({ where: { slug: params.slug } });
  if (!u) return { title: "Update not found" };
  return {
    title: `v${u.version} — ${u.title}`,
    description: u.summary || u.title,
  };
}

export default async function UpdateDetailPage({ params }: { params: { slug: string } }) {
  const u = await prisma.update.findUnique({ where: { slug: params.slug } });
  if (!u || !u.publishedAt) notFound();

  const [older, newer] = await Promise.all([
    prisma.update.findFirst({
      where: { publishedAt: { lt: u.publishedAt } },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.update.findFirst({
      where: { publishedAt: { gt: u.publishedAt } },
      orderBy: { publishedAt: "asc" },
    }),
  ]);
  let images: string[] = [];
  try {
    images = JSON.parse(u.images || "[]");
  } catch {
    images = [];
  }

  return (
    <article className="min-h-screen">
      <Section
        eyebrow="Changelog"
        title={`v${u.version} — ${u.title}`}
        subtitle={formatDate(u.publishedAt)}
      >
        <div className="max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-brand-700 dark:text-brand-300">v{u.version}</span>
            <Badge tone={u.type === "MAJOR" ? "danger" : u.type === "MINOR" ? "brand" : "neutral"}>
              {getUpdateTypeLabel(u.type)}
            </Badge>
            <span className="text-sm text-ink-500 dark:text-ink-400">{formatDate(u.publishedAt)}</span>
          </div>

          {u.summary && (
            <p className="text-lg text-ink-600 dark:text-ink-300">{u.summary}</p>
          )}

          <div className="mt-8 space-y-8">
            {u.whatsNew && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">What&rsquo;s New</h2>
                <div className="mt-2"><Markdown content={u.whatsNew} /></div>
              </div>
            )}
            {u.improvements && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">Improvements</h2>
                <div className="mt-2"><Markdown content={u.improvements} /></div>
              </div>
            )}
            {u.bugFixes && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">Bug Fixes</h2>
                <div className="mt-2"><Markdown content={u.bugFixes} /></div>
              </div>
            )}
            {u.securityNotes && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">Security & Moderation</h2>
                <div className="mt-2"><Markdown content={u.securityNotes} /></div>
              </div>
            )}
            {images.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">Images</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {images.map((url, i) => (
                    <Card key={i} className="overflow-hidden p-0">
                      <Image
                        src={url}
                        alt=""
                        width={800}
                        height={500}
                        className="aspect-video w-full object-cover"
                        loading="lazy"
                      />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-ink-200 pt-6 dark:border-ink-800">
            {older && (
              <Link href={`/updates/${older.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
                <span aria-hidden>←</span> v{older.version}
              </Link>
            )}
            {newer && (
              <Link href={`/updates/${newer.slug}`} className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
                v{newer.version} <span aria-hidden>→</span>
              </Link>
            )}
            <Link href="/updates" className="text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200">
              All updates
            </Link>
          </div>
        </div>
      </Section>
    </article>
  );
}