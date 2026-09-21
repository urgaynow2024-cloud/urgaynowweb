import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata = {
  title: "Staff",
  description: "Meet the Ur Gay Now team — staff, moderators, and community leads.",
};

type StaffDirectoryEntry = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  socials: string;
  sortOrder: number;
  hostedEvents: { id: string }[];
};

function staffHref(query: { q?: string; rank?: string }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.rank) params.set("rank", query.rank);
  const search = params.toString();
  return search ? `/staff?${search}` : "/staff";
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: { q?: string; rank?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const rank = searchParams.rank?.trim() || "";
  const where: Prisma.StaffWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { vrchatUsername: { contains: q, mode: "insensitive" } },
            { rank: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(rank ? { rank } : {}),
  };

  const [staff, allStaff] = await Promise.all([
    safeQuery<StaffDirectoryEntry[]>(
      async () =>
        (await prisma.staff.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: { hostedEvents: { where: { published: true }, select: { id: true } } },
        })) as StaffDirectoryEntry[],
      [],
    ),
    safeQuery<StaffDirectoryEntry[]>(
      async () =>
        (await prisma.staff.findMany({
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: { hostedEvents: { where: { published: true }, select: { id: true } } },
        })) as StaffDirectoryEntry[],
      [],
    ),
  ]);
  const [discord, vrchat] = await Promise.all([
    getSetting("discordInvite"),
    getSetting("vrchatGroupUrl"),
  ]);

  const ranks = Array.from(new Set(allStaff.map((s) => s.rank).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const groups = Array.from(
    staff.reduce((acc, person) => {
      const current = acc.get(person.rank) ?? [];
      current.push(person);
      acc.set(person.rank, current);
      return acc;
    }, new Map<string, StaffDirectoryEntry[]>()),
  )
    // Order section groups by the ranking of the highest-ranked member in each
    // group (i.e. by `sortOrder`), so the visible hierarchy matches the staff
    // ranking exactly. This preserves the existing sortOrder source of truth
    // and must NOT be replaced with alphabetical / role-name sorting.
    .sort(([, aMembers], [, bMembers]) => {
      const aFirst = aMembers[0]?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bFirst = bMembers[0]?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aFirst !== bFirst) return aFirst - bFirst;
      return aMembers[0]?.rank.localeCompare(bMembers[0]?.rank ?? "") ?? 0;
    });

  return (
    <>
      <PageHeader
        title="Meet the Team"
        description="The people behind Ur Gay Now — building a safer, warmer, and more welcoming VRChat community together."
      />
      <Container className="py-12 sm:py-16">
        <form method="get" className="mb-8 flex flex-col gap-3 rounded-2xl border border-ink-200/70 bg-white/80 p-4 shadow-card backdrop-blur dark:border-ink-800 dark:bg-ink-900/60">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input name="q" defaultValue={q} placeholder="Search the team…" className="input pl-10" aria-label="Search staff" />
            </div>
            <div className="relative sm:w-56">
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              <select name="rank" defaultValue={rank} className="select pl-10 pr-9" aria-label="Filter by rank">
                <option value="">All ranks</option>
                {ranks.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary btn-sm sm:self-stretch">Search</button>
            {(q || rank) && <Link href={staffHref({})} className="btn-ghost btn-sm sm:self-stretch">Clear filters</Link>}
          </div>
          {(q || rank) && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-500 dark:text-ink-400">Active:</span>
              {q && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">Search: {q}</span>}
              {rank && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">Rank: {rank}</span>}
            </div>
          )}
        </form>

        {staff.length === 0 ? (
          <EmptyState
            icon="👥"
            title={q || rank ? "No team members found" : "Team directory coming soon"}
            description={q || rank ? "Try a different search or clear the filters to see the full team." : "Our staff profiles are being set up. Check back soon to meet the team!"}
            action={!q && !rank ? <Link href="/admin/staff" className="btn-primary">Visit staff admin</Link> : undefined}
          />
        ) : (
          <div className="space-y-14">
            {groups.map(([groupRank, members]) => (
              <section key={groupRank}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <SectionHeading>{groupRank}</SectionHeading>
                  <span className="mb-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </span>
                </div>
                <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((s, i) => (
                    <ScrollFadeIn key={s.id} delay={i * 60}>
                      <StaffCard
                        staff={{
                          id: s.id,
                          name: s.name,
                          vrchatUsername: s.vrchatUsername,
                          rank: s.rank,
                          bio: s.bio,
                          photoUrl: s.photoUrl,
                          socials: s.socials,
                          hostedEventCount: s.hostedEvents.length,
                        }}
                      />
                    </ScrollFadeIn>
                  ))}
                </StaggeredList>
              </section>
            ))}
          </div>
        )}

        {(discord || vrchat) && (
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-cta">
                <span className="relative z-10 flex items-center gap-2">Join our Discord</span>
              </a>
            )}
            {vrchat && (
              <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-lg">VRChat Group</a>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
