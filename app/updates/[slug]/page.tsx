import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Container, Section } from "@/components/Container";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";
import { getUpdateTypeLabel, getUpdateCategoryLabel, getUpdateCategoryTone } from "@/lib/update-utils";
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
  if (!u) notFound();

  const session = await getSession();
  const isAdmin = Boolean(session);
  const isPreview = !u.publishedAt;
  if (isPreview && !isAdmin) notFound();

  const publishedAt = u.publishedAt;
  const [older, newer] = publishedAt
    ? await Promise.all([
        prisma.update.findFirst({
          where: { publishedAt: { lt: publishedAt } },
          orderBy: { publishedAt: "desc" },
        }),
        prisma.update.findFirst({
          where: { publishedAt: { gt: publishedAt } },
          orderBy: { publishedAt: "asc" },
        }),
      ])
    : [null, null];
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
        subtitle={publishedAt ? formatDate(publishedAt) : "Draft"}
      >
        <div className="max-w-3xl">
          {isPreview && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
            >
              Draft preview — this update is not published and is not visible to visitors.
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-brand-700 dark:text-brand-300">v{u.version}</span>
            <Badge tone={u.type === "MAJOR" ? "danger" : u.type === "MINOR" ? "brand" : "neutral"}>
              {getUpdateTypeLabel(u.type)}
            </Badge>
            <Badge tone={getUpdateCategoryTone(u.category)} dot>
              {getUpdateCategoryLabel(u.category)}
            </Badge>
            {u.featured && (
              <span
                className="inline-flex items-center gap-1 text-amber-500"
                aria-label="Featured update"
                title="Featured update"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.7 5.4A5 5 0 0 0 17.8 11l3 2.4-3.6 1L12 17l-5.2 3.4L3.2 13.4 0 11a5 5 0 0 0 2.5-3.3z" />
                </svg>
                Featured
              </span>
            )}
            <span className="text-sm text-ink-500 dark:text-ink-400">
              {publishedAt ? formatDate(publishedAt) : "Draft"}
            </span>
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