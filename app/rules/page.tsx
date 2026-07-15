import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";
import { safeQuery } from "@/lib/safeQuery";

export const dynamic = "force-dynamic";

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
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">Rules will be published soon.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat}>
                <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-zinc-900 dark:text-white">
                  <span className="h-4 w-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-700" aria-hidden />
                  {cat}
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {rules
                    .filter((r) => r.category === cat)
                    .map((r, i) => (
                      <div key={r.id} className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:focus-visible:ring-offset-ink-950">
                        <h3 className={cn("text-xl font-semibold text-brand-700 dark:text-brand-200")}>
                          {i + 1}. {r.title}
                        </h3>
                        <div className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
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
