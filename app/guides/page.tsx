import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";

export const revalidate = 300;

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
      <Container className="py-12">
        {guides.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            Guides and FAQs are on the way.
          </p>
        ) : (
          <div className="space-y-10">
            {categories.map((cat) => (
              <section key={cat}>
                <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-zinc-900 dark:text-white">
                  <span className="h-3 w-8 rounded-full bg-pride-gradient" aria-hidden />
                  {cat}
                </h2>
                <div className="space-y-3">
                  {guides
                    .filter((g) => g.category === cat)
                    .map((g) => (
                      <details
                        key={g.id}
                        className="group rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <summary className="cursor-pointer list-none text-lg font-semibold text-zinc-900 dark:text-white">
                          <span className="mr-2 text-brand-500">+</span>
                          {g.question}
                        </summary>
                        <div className="mt-3 text-zinc-600 dark:text-zinc-400">
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
