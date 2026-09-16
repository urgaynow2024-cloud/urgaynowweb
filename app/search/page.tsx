import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { eventMatchesSearch, toEventCard, type EventCardSource } from "@/lib/event-utils";
import SearchResults from "@/components/SearchResults";

export const revalidate = 60;

export const metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

type Result = { href: string; title: string; snippet: string; kind: string };

type Announcement = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date | null;
};

type Event = EventCardSource;

type Staff = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  socials: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  let announcements: Announcement[] = [];
  let events: Event[] = [];
  let staff: Staff[] = [];
  let guides: Result[] = [];
  let partners: Result[] = [];
  let links: Result[] = [];
  let galleryImages: Result[] = [];
  let updates: Result[] = [];

  if (q) {
    const term = q;
    [
      announcements,
      events,
      staff,
      guides,
      partners,
      links,
      galleryImages,
      updates,
    ] = await Promise.all([
      safeQuery(
        () =>
          prisma.announcement.findMany({
            where: {
              state: "PUBLISHED",
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
            where: { published: true },
            orderBy: { startDateTime: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              location: true,
              vrchatWorldUrl: true,
              coverImage: true,
              startDateTime: true,
              endDateTime: true,
              hostName: true,
              category: true,
              tags: true,
              timezone: true,
              archivedAt: true,
            },
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
                ],
              },
              take: 12,
            })
            .then((rows) =>
              rows.map((g) => ({
                href: `/guides/${g.slug}`,
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
      safeQuery(
        () =>
          prisma.galleryImage
            .findMany({
              where: {
                published: true,
                OR: [
                  { title: { contains: term } },
                  { description: { contains: term } },
                  { submitterName: { contains: term } },
                ],
              },
              orderBy: { publishedAt: "desc" },
              take: 12,
            })
            .then((rows) =>
              rows.map((g) => ({
                href: `/gallery`,
                title: g.title,
                snippet: g.description.replace(/\s+/g, " ").slice(0, 160) || "Gallery image",
                kind: "Gallery",
              })),
            ),
        [],
      ),
      safeQuery(
        () =>
          prisma.update
            .findMany({
              where: {
                publishedAt: { not: null },
                OR: [
                  { title: { contains: term } },
                  { summary: { contains: term } },
                  { whatsNew: { contains: term } },
                  { version: { contains: term } },
                ],
              },
              orderBy: { publishedAt: "desc" },
              take: 12,
            })
            .then((rows) =>
              rows.map((u) => ({
                href: `/updates/${u.slug}`,
                title: `${u.version} — ${u.title}`,
                snippet: u.summary.replace(/\s+/g, " ").slice(0, 160),
                kind: u.type,
              })),
            ),
        [],
      ),
    ]);
  }

  events = events
    .filter((event) => eventMatchesSearch(event as any, q))
    .slice(0, 12);
  const eventCards = events.map(toEventCard);

  return (
    <SearchResults
      initialQ={q}
      initialResults={{
        announcements,
        events: eventCards,
        staff,
        guides,
        galleryImages,
        updates,
        partners,
        links,
      }}
    />
  );
}