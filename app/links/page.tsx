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
      <Container className="py-12">
        {featured.length > 0 && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {featured.map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-3xl" aria-hidden>{f.icon}</span>
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">{f.label}</span>
                <span className="ml-auto text-brand-600 dark:text-brand-300">↗</span>
              </a>
            ))}
          </div>
        )}

        {links.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {l.icon && <span className="text-xl" aria-hidden>{l.icon}</span>}
                  <span className="font-medium text-zinc-900 dark:text-white">{l.label}</span>
                  <span className="ml-auto text-brand-600 dark:text-brand-300">↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            No links have been added.
          </p>
        )}
      </Container>
    </>
  );
}
