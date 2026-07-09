import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

export const revalidate = 300;

export const metadata = {
  title: "Links",
  description: "All the important Ur Gay Now links — socials, Discord, VRChat, and more.",
};

export default async function LinksPage() {
  const [links, discord, vrchat] = await Promise.all([
    prisma.link.findMany({ orderBy: { sortOrder: "asc" } }),
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
      <Container className="py-16">
        {featured.length > 0 && (
          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            {featured.map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl" aria-hidden>{f.icon}</span>
                  <span className="text-xl font-semibold text-zinc-900 dark:text-white">{f.label}</span>
                  <span className="ml-auto text-2xl text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-300">↗</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {links.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-700"
                >
                  <div className="flex items-center gap-3">
                    {l.icon && <span className="text-2xl" aria-hidden>{l.icon}</span>}
                    <span className="text-lg font-medium text-zinc-900 dark:text-white">{l.label}</span>
                    <span className="ml-auto text-xl text-brand-600 transition-transform group-hover:translate-x-1 dark:text-brand-300">↗</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">No links have been added.</p>
          </div>
        )}
      </Container>
    </>
  );
}
