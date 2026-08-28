import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata = {
  title: "Guides & FAQ",
  description: "Helpful guides and frequently asked questions for the Ur Gay Now community.",
};

export default async function GuidesPage() {
  const guides = await safeQuery(
    () =>
      prisma.guide.findMany({
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
        {guides.length === 0 ? (
          <EmptyState
            icon="❓"
            title="Guides and FAQs are on the way"
            description="Helpful resources are being prepared. Check back soon!"
          />
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat}>
                <SectionHeading>{cat}</SectionHeading>
                <div className="space-y-4">
                  {guides
                    .filter((g) => g.category === cat)
                    .map((g, i) => (
                      <ScrollFadeIn key={g.id} delay={i * 60}>
                        <details
                          className="card card-hover group overflow-hidden"
                        >
                          <summary className="flex cursor-pointer list-none select-none items-center gap-3 px-6 py-5 text-xl font-semibold text-ink-900 transition-colors hover:text-brand-700 dark:text-white dark:hover:text-brand-200">
                            <span
                              className="text-brand-500 transition-transform duration-200 group-open:rotate-45"
                              aria-hidden
                            >
                              +
                            </span>
                            {g.question}
                          </summary>
                          <div className="px-6 pb-5 text-base text-ink-500 dark:text-ink-400">
                            <Markdown content={g.answer} />
                          </div>
                        </details>
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
