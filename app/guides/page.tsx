import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guides & FAQ",
  description: "Helpful guides and frequently asked questions for the Ur Gay Now community.",
};

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
  });
  const categories = Array.from(new Set(guides.map((g) => g.category)));

  return (
    <>
      <PageHeader
        title="Guides & FAQ"
        description="Answers to common questions and guides to help you get the most out of the community."
      />
      <Container className="py-16">
        {guides.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">Guides and FAQs are on the way.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <section key={cat}>
                <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-zinc-900 dark:text-white">
                  <span className="h-4 w-12 rounded-full bg-gradient-to-r from-brand-600 to-brand-700" aria-hidden />
                  {cat}
                </h2>
                <div className="space-y-4">
                  {guides
                    .filter((g) => g.category === cat)
                    .map((g) => (
                      <details
                        key={g.id}
                        className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white transition-all duration-300 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700 dark:focus-visible:ring-offset-ink-950"
                      >
                        <summary className="cursor-pointer list-none select-none px-6 py-5 text-xl font-semibold text-zinc-900 transition-colors hover:text-brand-700 dark:text-white dark:hover:text-brand-200">
                          <span className="mr-3 text-brand-500 transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
                          {g.question}
                        </summary>
                        <div className="px-6 pb-5 text-base text-zinc-600 dark:text-zinc-400">
                          <Markdown content={g.answer} />
                        </div>
                      </details>
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
