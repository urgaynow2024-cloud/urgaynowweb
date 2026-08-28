import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 3600;

export const metadata = {
  title: "Rules",
  description: "Server and community rules for Ur Gay Now.",
};

export default async function RulesPage() {
  const rules = await safeQuery(
    () => prisma.rule.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    [] as Awaited<ReturnType<typeof prisma.rule.findMany>>,
  );

  const categories = Array.from(new Set(rules.map((r) => r.category)));

  return (
    <>
      <PageHeader
        title="Community Rules"
        description="These rules keep our community safe and welcoming for everyone. By participating, you agree to follow them."
      />
      <Container className="py-16">
        {rules.length === 0 ? (
          <EmptyState
            icon="📜"
            title="Rules will be published soon"
            description="We're finalizing our community guidelines. Check back soon!"
          />
        ) : (
          <div className="space-y-16">
            {categories.map((cat) => (
              <section key={cat}>
                <SectionHeading>{cat}</SectionHeading>
                <StaggeredList className="grid gap-6 md:grid-cols-2">
                  {rules
                    .filter((r) => r.category === cat)
                    .map((r, i) => (
                      <ScrollFadeIn key={r.id} delay={i * 60}>
                        <div className="card card-hover p-6">
                          <h3 className="text-xl font-semibold text-brand-700 dark:text-brand-200">
                            {i + 1}. {r.title}
                          </h3>
                          <div className="mt-3 text-base text-ink-500 dark:text-ink-400">
                            <Markdown content={r.content} />
                          </div>
                        </div>
                      </ScrollFadeIn>
                    ))}
                </StaggeredList>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
