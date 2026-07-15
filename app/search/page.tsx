import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EventCard } from "@/components/EventCard";
import { StaffCard } from "@/components/StaffCard";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";

export const revalidate = 60;

export const metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

type Result = { href: string; title: string; snippet: string; kind: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  let announcements: Awaited<ReturnType<typeof prisma.announcement.findMany>> = [];
  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  let staff: Awaited<ReturnType<typeof prisma.staff.findMany>> = [];
  let guides: Result[] = [];
  let partners: Result[] = [];
  let links: Result[] = [];

  if (q) {
    const term = q;
    [announcements, events, staff, guides, partners, links] = await Promise.all([
      safeQuery(
        () =>
          prisma.announcement.findMany({
            where: {
              published: true,
              OR: [
                { title: { contains: term } },
                { excerpt: { contains: term } },
                { content: { contains: term } },
              ],
            },
            orderBy: { publishedAt: "desc" },
            take: 12,
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.event.findMany({
            where: {
              OR: [
                { title: { contains: term } },
                { description: { contains: term } },
                { location: { contains: term } },
              ],
            },
            orderBy: { startDateTime: "asc" },
            take: 12,
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.staff.findMany({
            where: {
              OR: [
                { name: { contains: term } },
                { rank: { contains: term } },
                { bio: { contains: term } },
              ],
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            take: 12,
          }),
        [],
      ),
      safeQuery(
        () =>
          prisma.guide
            .findMany({
              where: {
                OR: [
                  { question: { contains: term } },
                  { answer: { contains: term } },
                  { category: { contains: term } },
                ],
              },
              take: 12,
            })
            .then((rows) =>
              rows.map((g) => ({
                href: "/guides",
                title: g.question,
                snippet: g.answer.replace(/\s+/g, " ").slice(0, 160),
                kind: g.category,
              })),
            ),
        [],
      ),
      safeQuery(
        () =>
          prisma.partner
            .findMany({
              where: {
                OR: [{ name: { contains: term } }, { description: { contains: term } }],
              },
              take: 12,
            })
            .then((rows) =>
              rows.map((p) => ({
                href: "/partners",
                title: p.name,
                snippet: p.description.replace(/\s+/g, " ").slice(0, 160),
                kind: p.tag,
              })),
            ),
        [],
      ),
      safeQuery(
        () =>
          prisma.link
            .findMany({
              where: { OR: [{ label: { contains: term } }, { url: { contains: term } }] },
              orderBy: { sortOrder: "asc" },
              take: 12,
            })
            .then((rows) =>
              rows.map((l) => ({
                href: l.url,
                title: l.label,
                snippet: l.url,
                kind: "Link",
              })),
            ),
        [],
      ),
    ]);
  }

  const total =
    announcements.length +
    events.length +
    staff.length +
    guides.length +
    partners.length +
    links.length;

  return (
    <>
      <PageHeader
        title="Search"
        description="Find announcements, guides, staff, events and more across the community."
      />
      <Container className="py-12">
        <div className="mx-auto max-w-2xl">
          <SearchBox initial={q} autoFocus={!q} />
        </div>

        {!q ? (
          <p className="mx-auto mt-10 max-w-2xl text-center text-zinc-500 dark:text-zinc-400">
            Type something above to search the site.
          </p>
        ) : total === 0 ? (
          <p className="mx-auto mt-10 max-w-2xl text-center text-zinc-500 dark:text-zinc-400">
            No results for <span className="font-semibold text-zinc-700 dark:text-zinc-200">“{q}”</span>.
            Try a different keyword.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            {announcements.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Announcements
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {announcements.map((a) => (
                    <AnnouncementCard
                      key={a.id}
                      item={{
                        id: a.id,
                        title: a.title,
                        slug: a.slug,
                        excerpt: a.excerpt,
                        coverImage: a.coverImage,
                        publishedAt: a.publishedAt,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {events.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Events
                </h2>
                <div className="grid gap-4">
                  {events.map((e) => (
                    <EventCard
                      key={e.id}
                      event={{
                        id: e.id,
                        title: e.title,
                        description: e.description,
                        location: e.location,
                        vrchatWorldUrl: e.vrchatWorldUrl,
                        coverImage: e.coverImage,
                        startDateTime: e.startDateTime,
                        endDateTime: e.endDateTime,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {staff.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Staff
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {staff.map((s) => (
                    <StaffCard
                      key={s.id}
                      staff={{
                        id: s.id,
                        name: s.name,
                        vrchatUsername: s.vrchatUsername,
                        rank: s.rank,
                        bio: s.bio,
                        photoUrl: s.photoUrl,
                        socials: s.socials,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            <SimpleResults title="Guides" results={guides} />
            <SimpleResults title="Partners" results={partners} />
            <SimpleResults title="Links" results={links} external />
          </div>
        )}
      </Container>
    </>
  );
}

function SimpleResults({
  title,
  results,
  external = false,
}: {
  title: string;
  results: Result[];
  external?: boolean;
}) {
  if (results.length === 0) return null;
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {results.map((r, i) => {
          const inner = (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-zinc-900 dark:text-white">{r.title}</p>
                {r.kind && (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {r.kind}
                  </span>
                )}
              </div>
              {r.snippet && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{r.snippet}</p>
              )}
            </>
          );
          return (
            <li key={i}>
              {external ? (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  href={r.href}
                  className="block px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
