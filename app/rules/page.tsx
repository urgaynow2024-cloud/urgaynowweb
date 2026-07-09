import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Rules",
  description: "Server and community rules for Ur Gay Now.",
};

export default async function RulesPage() {
  const rules = await prisma.rule.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });

  const categories = Array.from(new Set(rules.map((r) => r.category)));

  return (
    <>
      <PageHeader
        title="Community Rules"
        description="These rules keep our community safe and welcoming for everyone. By participating, you agree to follow them."
      />
      <Container className="py-12">
        {rules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            Rules will be published soon.
          </p>
        ) : (
          <div className="space-y-10">
            {categories.map((cat) => (
              <section key={cat}>
                <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-zinc-900 dark:text-white">
                  <span className="h-3 w-8 rounded-full bg-pride-gradient" aria-hidden />
                  {cat}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {rules
                    .filter((r) => r.category === cat)
                    .map((r, i) => (
                      <div key={r.id} className="card">
                        <h3 className={cn("text-lg font-semibold text-brand-700 dark:text-brand-200")}>
                          {i + 1}. {r.title}
                        </h3>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <Markdown content={r.content} />
                        </div>
                      </div>
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
