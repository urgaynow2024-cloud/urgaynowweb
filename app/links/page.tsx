import { PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 3600;

export const metadata = {
  title: "Links",
  description: "All the important Ur Gay Now links — socials, Discord, VRChat, and more.",
};

export default async function LinksPage() {
  const links = await safeQuery(
    () => prisma.link.findMany({ orderBy: { sortOrder: "asc" } }),
    [] as Awaited<ReturnType<typeof prisma.link.findMany>>,
  );
  const [discord, vrchat] = await Promise.all([
    getSetting("discordInvite"),
    getSetting("vrchatGroupUrl"),
  ]);

  const featured = [
    ...(discord ? [{ icon: "💬", label: "Discord Server", url: discord }] : []),
    ...(vrchat ? [{ icon: "🌐", label: "VRChat Group", url: vrchat }] : []),
  ];

  return (
    <>
      <PageHeader title="Links" description="Everything in one place — find us across the web." />
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        {featured.length > 0 && (
          <section>
            <SectionHeading>Featured</SectionHeading>
            <StaggeredList className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {featured.map((f, i) => (
                <ScrollFadeIn key={f.url} delay={i * 80}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-hover group flex w-full min-w-0 items-center gap-4 p-6"
                  >
                    <span className="text-4xl" aria-hidden>
                      {f.icon}
                    </span>
                    <span className="text-xl font-semibold text-ink-900 dark:text-white">
                      {f.label}
                    </span>
                    <span className="ml-auto text-2xl text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-300">
                      ↗
                    </span>
                  </a>
                </ScrollFadeIn>
              ))}
            </StaggeredList>
          </section>
        )}

        {links.length > 0 ? (
          <section className={featured.length > 0 ? "mt-12" : ""}>
            <SectionHeading>All links</SectionHeading>
            <StaggeredList className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l, i) => (
                <ScrollFadeIn key={l.id} delay={i * 60}>
                  <li className="w-full min-w-0 list-none">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card card-hover group flex w-full min-w-0 items-center gap-3 p-5"
                    >
                      {l.icon && (
                        <span className="text-2xl" aria-hidden>
                          {l.icon}
                        </span>
                      )}
                      <span className="text-lg font-medium text-ink-900 dark:text-white">
                        {l.label}
                      </span>
                      <span className="ml-auto text-xl text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-300">
                        ↗
                      </span>
                    </a>
                  </li>
                </ScrollFadeIn>
              ))}
            </StaggeredList>
          </section>
        ) : (
          <EmptyState
            icon="🔗"
            title="No links have been added"
            description="Links will appear here once they're set up by staff."
          />
        )}
      </div>
    </>
  );
}
