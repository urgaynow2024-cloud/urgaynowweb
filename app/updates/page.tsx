import Link from "next/link";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Container";
import { formatDate } from "@/lib/utils";
import { getUpdateTypeLabel, getUpdateCategoryLabel, getUpdateCategoryTone } from "@/lib/update-utils";
import { Badge, Card, EmptyState } from "@/components/ui";

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: "Updates & Changelog",
    description: "Website releases, feature updates, and bug fixes for Ur Gay Now.",
  };
}

export default async function UpdatesPage() {
  let updates: Awaited<ReturnType<typeof prisma.update.findMany>> = [];
  try {
    updates = await prisma.update.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
  } catch (e) {
    console.error("Failed to load updates:", e);
  }

  return (
    <div className="min-h-screen">
      <Section
        eyebrow="Changelog"
        title="Updates & releases"
        subtitle="Everything that changed, in one place. Newest first."
      >
        <div className="max-w-3xl">
          {updates.length === 0 ? (
            <EmptyState
              icon="Updates"
              title="No published updates yet"
              description="Check back soon for release notes and product improvements."
            />
          ) : (
            <div className="space-y-6">
              {updates.map((u) => (
                <Card
                  key={u.id}
                  hover
                  className="group relative overflow-hidden p-6"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-500 to-brand-700" />
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-brand-700 dark:text-brand-300">v{u.version}</span>
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
                    <span className="ml-auto text-ink-400 dark:text-ink-500">
                      {u.publishedAt ? formatDate(u.publishedAt) : ""}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200">
                    {u.title}
                  </h2>
                  {u.summary && (
                    <p className="mt-1 text-ink-500 dark:text-ink-400">{u.summary}</p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/updates/${u.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                    >
                      Read full update
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
