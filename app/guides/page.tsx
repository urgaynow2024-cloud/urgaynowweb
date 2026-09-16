import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";
import { Badge, Button, Card } from "@/components/ui";
import Link from "next/link";
import { IconSearch, IconExternal } from "@/components/admin/ui/icons";

export const revalidate = 300;

export const metadata = {
  title: "Guides & FAQ",
  description: "Helpful guides and frequently asked questions for the Ur Gay Now community.",
};

function formatCategory(cat: string): string {
  return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() || "";

  const guides = await safeQuery(
    () =>
      prisma.guide.findMany({
        where: q ? { question: { contains: q, mode: "insensitive" } } : {},
        orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
      }),
    [] as Awaited<ReturnType<typeof prisma.guide.findMany>>,
  );
  const categories = Array.from(new Set(guides.map((g) => g.category)));

  return (
    <>
      <PageHeader
        title="Guides & FAQ"
        description="Answers to common questions and guides to help you get the most out of the community."
      />
      <Container className="py-16">
        <div className="mb-8 max-w-2xl">
          <form method="get" className="relative">
            <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search guides…"
              className="input pl-12 pr-4 py-3 text-base"
            />
          </form>
          {q && (
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Showing results for &ldquo;{q}&rdquo;{" "}
              <Link href="/guides" className="underline hover:text-brand-600 dark:hover:text-brand-400">
                Clear
              </Link>
            </p>
          )}
        </div>

        {guides.length === 0 ? (
          <EmptyState
            icon="❓"
            title={q ? "No guides match your search" : "Guides and FAQs are on the way"}
            description={q ? "Try a different search or clear the filters." : "Helpful resources are being prepared. Check back soon!"}
            action={!q ? <Link href="/admin/guides/new"><Button>Add guide</Button></Link> : undefined}
          />
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat}>
                <SectionHeading>{formatCategory(cat)}</SectionHeading>
                <div className="space-y-3">
                  {guides
                    .filter((g) => g.category === cat)
                    .map((g, i) => (
                      <ScrollFadeIn key={g.id} delay={i * 40}>
                        <Card hover className="group flex items-start gap-4 p-5 transition-all duration-200">
                          <Link href={`/guides/${g.slug}`} className="min-w-0 flex-1">
                            <div className="mb-2">
                              <Badge tone="brand">{formatCategory(g.category)}</Badge>
                            </div>
                            <h3 className="font-semibold text-lg text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {g.question}
                            </h3>
                            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
                              {g.answer.replace(/[#*`\[\]]/g, "").slice(0, 160)}…
                            </p>
                          </Link>
                          <IconExternal size={20} className="text-ink-300 dark:text-ink-600 group-hover:text-brand-500 transition-colors shrink-0" />
                        </Card>
                      </ScrollFadeIn>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}