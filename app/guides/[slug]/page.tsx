import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { Card, CardBody } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import Link from "next/link";
import { IconCalendar, IconExternal } from "@/components/admin/ui/icons";

export const revalidate = 300;

export async function generateStaticParams() {
  const guides = await prisma.guide.findMany({ select: { slug: true } });
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug }, select: { question: true } });
  return {
    title: guide?.question || "Guide",
    description: guide?.question || "Help article",
  };
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { relatedGuides: { select: { id: true, slug: true, question: true, category: true } } },
  });

  if (!guide) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={guide.question}
        description={`${formatCategory(guide.category)} · Last updated ${formatDate(guide.updatedAt)}`}
      />
      <Container className="max-w-3xl py-12 sm:py-16">
        <Card className="animate-fade-in">
          <CardBody className="space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown content={guide.answer} />
            </div>

            <div className="pt-6 border-t border-ink-100 dark:border-ink-800 flex flex-wrap items-center gap-4">
              <span className="text-sm text-ink-500 dark:text-ink-400">
                Last updated: <time dateTime={guide.updatedAt.toISOString()}>{formatDate(guide.updatedAt)}</time>
              </span>
              <Link
                href="/api/report/submit"
                className="btn-outline btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconExternal size={14} /> Still need help? Report an issue
              </Link>
            </div>

            {guide.relatedGuides && guide.relatedGuides.length > 0 && (
              <div className="pt-6 border-t border-ink-100 dark:border-ink-800">
                <h3 className="text-lg font-semibold text-ink-900 dark:text-white mb-4">Related articles</h3>
                <ul className="space-y-2">
                  {guide.relatedGuides.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/guides/${related.slug}`}
                        className="flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                      >
                        <IconExternal size={14} />
                        <span>{related.question}</span>
                        <span className="text-xs text-ink-400 dark:text-ink-500">({formatCategory(related.category)})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

function formatCategory(cat: string): string {
  return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}