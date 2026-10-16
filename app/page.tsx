import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/Container";
import { HalloweenHeroStrip } from "@/components/halloween/HalloweenDecor";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EventCard } from "@/components/EventCard";
import { StaffCard } from "@/components/StaffCard";
import { getSettings } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { Skeleton, CardGridSkeleton } from "@/components/Skeleton";
import { HeroBackground, ParticlesBackground } from "@/components/HeroBackground";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { IconVrchat, IconDiscord, IconCalendar, IconImages, IconUsers, IconSparkles, IconArrowRight } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/EmptyState";
import { getEventState, toEventCard } from "@/lib/event-utils";

export const revalidate = 60;

/** Spiderweb corner inside the hero. Decorative only. */
function HeroWeb({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" focusable="false">
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.8">
        {[16, 30, 44, 58, 72].map((r) => (
          <circle key={r} cx="0" cy="0" r={r} />
        ))}
        {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
          <line key={deg} x1="0" y1="0" x2="0" y2="-72" transform={`rotate(${deg})`} />
        ))}
      </g>
    </svg>
  );
}

/** Distant bat silhouette drifting across the hero sky. Decorative only. */
function HeroBat({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 32" focusable="false">
      <path
        d="M32 16c-4-6-12-8-18-6 2 2 2 4 0 6-3-1-6 0-8 2 4 0 6 1 8 3-3 0-5 1-7 3 5 0 8 2 10 4 3-2 5-4 7-6l-1 8h6l-1-8c2 2 4 4 7 6 2-2 5-4 10-4-2-2-4-3-7-3 2-2 4-3 8-3-2-2-5-3-8-2-2-2-2-4 0-6-6-2-14 0-18 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

async function HeroContent() {
  // One query for all four settings instead of four separate reads.
  const settings = await safeQuery(
    () => getSettings(["homeIntro", "siteTagline", "discordInvite", "vrchatGroupUrl"]),
    {} as Record<string, string>,
  );
  const intro = settings.homeIntro ?? "";
  const tagline = settings.siteTagline ?? "";
  const discord = settings.discordInvite ?? "";
  const vrchat = settings.vrchatGroupUrl ?? "";
  const lead = intro || tagline;

  return (
    <>
      <p className="mt-8 max-w-2xl text-pretty text-lg text-ink-600 dark:text-ink-300 leading-relaxed sm:text-xl">
        {lead}
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/events" className="btn-cta group">
          <span className="relative z-10 flex items-center gap-2">
            Join the Community
            <IconArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
        <Link href="/about" className="btn-cta-secondary group">
          <span className="relative z-10 flex items-center gap-2">
            Explore UGN
            <IconSparkles size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          </span>
        </Link>
      </div>
      {(discord || vrchat) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {discord && (
            <a
              href={discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-ink-600 backdrop-blur-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
            >
              <IconDiscord size={16} />
              Discord
            </a>
          )}
          {vrchat && (
            <a
              href={vrchat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-ink-600 backdrop-blur-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-glow dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200"
            >
              <IconVrchat size={16} />
              VRChat Group
            </a>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Events older than this can never be LIVE or UPCOMING (see getEventState), so
 * the homepage never needs to look at them. Bounds the query on the
 * (published, startDateTime) index instead of loading the whole event history.
 */
const HOME_EVENT_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
const HOME_EVENT_LIMIT = 24;

async function HomeAnnouncements() {
  const announcements = await safeQuery(
    () =>
      prisma.announcement.findMany({
        // publishedAt is required by AnnouncementCard, so filter in the database
        // rather than discarding rows in JS.
        where: { state: "PUBLISHED", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        // Only what the card renders — skips the full Markdown body and all
        // Discord delivery metadata.
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
      }),
    [],
  );

  return announcements.length > 0 ? (
    <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a, i) => (
        <ScrollFadeIn key={a.id} delay={i * 80}>
          <AnnouncementCard
            item={{
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              coverImage: a.coverImage,
              publishedAt: a.publishedAt!,
            }}
          />
        </ScrollFadeIn>
      ))}
    </StaggeredList>
  ) : (
    <EmptyState
      icon="📭"
      title="No announcements yet"
      description="Check back soon for community news and updates!"
    />
  );
}

async function HomeEvents() {
  const now = new Date();
  const lookback = new Date(now.getTime() - HOME_EVENT_LOOKBACK_MS);
  const events = await safeQuery(
    () =>
      prisma.event.findMany({
        // The homepage only renders LIVE and UPCOMING cards. Drop finished and
        // archived events in SQL instead of loading every published event
        // (including their Markdown description and rules) and filtering in JS.
        where: {
          published: true,
          OR: [
            // Started within the lookback window — covers live events and any
            // long-running event with no end time.
            { startDateTime: { gte: lookback } },
            // Has not finished yet.
            { endDateTime: { gt: now } },
          ],
        },
        orderBy: { startDateTime: "asc" },
        take: HOME_EVENT_LIMIT,
        // Only the fields the card renders. Drops the full Markdown
        // description/rules and all Discord delivery metadata.
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
          timezone: true,
          archivedAt: true,
        },
      }),
    [],
  );
  const live = events.filter((event) => getEventState(event, now) === "LIVE");
  const upcoming = events.filter((event) => getEventState(event, now) === "UPCOMING");

  if (live.length === 0 && upcoming.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="Nothing on the horizon"
        description="No upcoming events scheduled right now. Follow us on socials for announcements!"
      />
    );
  }

  return (
    <div className="space-y-10">
      {live.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-brand-700/10 dark:from-brand-500/5 dark:via-transparent dark:to-brand-700/5" />
          <div className="hw-live-pill relative flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-brand-700/10 border border-brand-200/50 dark:border-brand-800/50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
              </span>
              <span className="text-lg font-extrabold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Live Now</span>
            </div>
            <span className="ml-2 text-sm text-brand-600 dark:text-brand-400">
              {live.length === 1 ? "1 event happening" : `${live.length} events happening`}
            </span>
          </div>
          <StaggeredList className="grid gap-4">
            {live.map((e, i) => (
              <ScrollFadeIn key={e.id} delay={i * 80}>
                <EventCard
                  event={toEventCard(e)}
                />
              </ScrollFadeIn>
            ))}
          </StaggeredList>
        </section>
      )}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-extrabold text-ink-900 dark:text-white">Upcoming</h2>
          <StaggeredList className="grid gap-4">
            {upcoming.map((e, i) => (
              <ScrollFadeIn key={e.id} delay={i * 80}>
                <EventCard
                  event={toEventCard(e)}
                />
              </ScrollFadeIn>
            ))}
          </StaggeredList>
        </section>
      )}
    </div>
  );
}

async function HomeStaff() {
  const staff = await safeQuery(
    () =>
      prisma.staff.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 6,
        // Only the public card fields — never the rest of the row.
        select: {
          id: true,
          name: true,
          vrchatUsername: true,
          rank: true,
          bio: true,
          photoUrl: true,
          socials: true,
        },
      }),
    [],
  );

  return staff.length > 0 ? (
    <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {staff.map((s, i) => (
        <ScrollFadeIn key={s.id} delay={i * 80}>
          <StaffCard
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
        </ScrollFadeIn>
      ))}
    </StaggeredList>
  ) : (
    <EmptyState
      icon="👥"
      title="Team directory coming soon"
      description="Our staff profiles are being set up. Check back soon to meet the team!"
    />
  );
}

async function HomeGallery() {
  const gallery = await safeQuery(
    () =>
      prisma.galleryImage.findMany({
        // Must match app/gallery/page.tsx: pending, rejected and unpublished
        // submissions are moderation-pending and must never render publicly.
        where: { status: "APPROVED", published: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        // Never expose submitter identity or moderation metadata to the public
        // homepage.
        select: { id: true, title: true, imageUrl: true },
      }),
    [],
  );
  if (gallery.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-t border-ink-200/80 bg-surface-50 dark:border-ink-800/80 dark:bg-surface-950">
      <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-20" />
      <Container>
        <Section title="From the community" subtitle="Snapshots of our favourite moments.">
          <StaggeredList className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallery.map((g) => (
              <ScrollFadeIn key={g.id} delay={0}>
                <div className="hw-gallery-tile hw-card-treat group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-card-premium-hover dark:border-ink-800 dark:bg-ink-900">
                  <Image
                    src={g.imageUrl}
                    alt={g.title}
                    width={400}
                    height={400}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="aspect-square w-full object-cover transition-transform duration-500 ease-spring-bounce group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 text-xs text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {g.title}
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </StaggeredList>
          <div className="mt-8">
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
            >
              Open the gallery
              <IconArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Section>
      </Container>
    </div>
  );
}

async function HomePolls() {
  type HomePollOption = { id: string; label: string };
  type HomePoll = { id: string; title: string; description: string; type: string; options: HomePollOption[] };
  const polls = await safeQuery(
    () =>
      prisma.poll.findMany({
        where: { published: true, closed: false },
        orderBy: { createdAt: "desc" },
        take: 3,
        // Drop Discord delivery metadata, vote limits and results visibility.
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          options: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, label: true },
          },
        },
      }) as Promise<HomePoll[]>,
    [] as HomePoll[],
  );

  if (polls.length === 0) return null;

  return (
    <div className="relative overflow-hidden border-t border-ink-200/80 bg-surface-50 dark:border-ink-800/80 dark:bg-surface-950">
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      <Container className="relative py-16 sm:py-20">
        <Section title="Active polls" subtitle="Have your say — voting is open.">
          <div className="grid gap-6 lg:grid-cols-3">
            {polls.map((poll, i) => (
              <ScrollFadeIn key={poll.id} delay={i * 80}>
                <div className="card-premium flex flex-col p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
                    </span>
                    <span className="badge badge-brand rounded-full px-2.5 py-1 text-xs font-semibold">
                      {poll.type === "SINGLE" ? "Single choice" : "Multiple choice"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white line-clamp-2">
                    {poll.title}
                  </h3>
                  {poll.description && (
                    <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
                      {poll.description}
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    {poll.options.slice(0, 3).map((option) => (
                      <div key={option.id} className="flex items-center gap-2 text-sm">
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                        <span className="text-ink-700 dark:text-ink-200">{option.label}</span>
                      </div>
                    ))}
                    {poll.options.length > 3 && (
                      <p className="text-xs text-ink-400">+{poll.options.length - 3} more</p>
                    )}
                  </div>
                  <div className="mt-auto pt-5">
                    <Link
                      href="/polls"
                      className="btn-primary btn-sm inline-flex items-center gap-1"
                    >
                      Vote
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/polls"
              className="group inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
            >
              View all polls
              <IconArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Section>
      </Container>
    </div>
  );
}

async function CommunityHighlights() {
  const [staffCount, eventCount, galleryCount] = await safeQuery(
    () =>
      Promise.all([
        prisma.staff.count(),
        prisma.event.count({ where: { published: true } }),
        // Must match the filter used by the gallery preview above so the count
        // cannot include moderation-pending images.
        prisma.galleryImage.count({ where: { status: "APPROVED", published: true } }),
      ]),
    [0, 0, 0],
  );

  const highlights = [
    { value: staffCount, label: "Staff & volunteers", icon: "👥" },
    { value: eventCount, label: "Events hosted", icon: "🎉" },
    { value: galleryCount, label: "Community photos", icon: "📸" },
  ];

  return (
    <div className="relative overflow-hidden border-t border-ink-200/80 dark:border-ink-800/80">
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      <Container className="relative py-16 sm:py-20">
        <Section title="Community highlights" subtitle="A snapshot of what we've built together.">
          <StaggeredList className="grid gap-6 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <ScrollFadeIn key={h.label} delay={i * 80}>
                <div className="hw-stat-card hw-card-treat card-premium flex flex-col items-center p-8 text-center">
                  <span className="text-4xl mb-4">{h.icon}</span>
                  <span className="text-4xl font-extrabold text-brand-700 dark:text-brand-200">
                    {h.value}
                  </span>
                  <span className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                    {h.label}
                  </span>
                </div>
              </ScrollFadeIn>
            ))}
          </StaggeredList>
        </Section>
      </Container>
    </div>
  );
}

const COMMUNITY_FEATURES = [
  {
    icon: <IconVrchat size={28} />,
    title: "VRChat",
    desc: "Hang out in VRChat worlds and events — full-body fun, games, and good vibes only.",
    color: "from-brand-500 to-brand-700",
  },
  {
    icon: <IconDiscord size={28} />,
    title: "Discord",
    desc: "Chat, share, and stay connected with 200+ community members on our Discord server.",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    icon: <IconCalendar size={28} />,
    title: "Events",
    desc: "Daily game nights, world parties, and special celebrations you won't want to miss.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: <IconImages size={28} />,
    title: "Community",
    desc: "Safe, inclusive spaces where you can be authentically you and find your people.",
    color: "from-violet-500 to-purple-700",
  },
  {
    icon: <IconUsers size={28} />,
    title: "Friends",
    desc: "Build lasting friendships with people who share your interests and energy.",
    color: "from-cyan-500 to-teal-600",
  },
];

function CommunitySection() {
  return (
    <div className="relative overflow-hidden border-t border-ink-200/80 dark:border-ink-800/80">
      <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
      <Container className="relative py-16 sm:py-20">
        <Section
          title="What we offer"
          subtitle="Multiple ways to hang out, connect, and celebrate together."
        >
          <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {COMMUNITY_FEATURES.map((f) => (
              <ScrollFadeIn key={f.title} delay={0}>
                <div className="hw-feature-card hw-card-treat group card-premium flex flex-col items-center p-6 text-center">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-strong`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                    {f.desc}
                  </p>
                </div>
              </ScrollFadeIn>
            ))}
          </StaggeredList>
        </Section>
      </Container>
    </div>
  );
}

function SectionFooter({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-8">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
      >
        {label}
        <IconArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <div className="hw-hero relative flex min-h-[90vh] items-center overflow-hidden border-b border-ink-200/80 dark:border-ink-800/80">
        <HeroBackground />
        <ParticlesBackground />
        <div className="hw-hero-sky" aria-hidden>
          <div className="hw-hero-stars" />
          <div className="hw-hero-moon" />
          <div className="hw-hero-fog" />
          <HeroWeb className="hw-hero-web hw-hero-web-tl" />
          <HeroWeb className="hw-hero-web hw-hero-web-tr" />
          <HeroBat className="hw-hero-bat hw-hero-bat-1" />
          <HeroBat className="hw-hero-bat hw-hero-bat-2" />
        </div>
        <Container className="relative z-10 py-24 sm:py-32 lg:py-36">
          <div className="animate-fade-in">
            <HalloweenHeroStrip />
            <ScrollFadeIn>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/50 bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm dark:border-brand-700/40 dark:bg-ink-900/80 dark:text-brand-200">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                LGBTQ+ friendly community
              </p>
            </ScrollFadeIn>
            <ScrollFadeIn delay={100}>
              <h1 className="mt-8 max-w-4xl text-balance text-5xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-7xl sm:leading-[1.1] lg:text-8xl">
                Welcome to{" "}
                <span className="text-gradient">
                  Ur Gay Now
                </span>
              </h1>
            </ScrollFadeIn>
            <Suspense
              fallback={
                <div className="mt-8 max-w-2xl space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-64" />
                </div>
              }
            >
              <HeroContent />
            </Suspense>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 opacity-60">
            <span className="text-xs font-medium text-ink-400 dark:text-ink-500">Scroll to explore</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-ink-300 p-1 dark:border-ink-600">
              <div className="h-1.5 w-1 rounded-full bg-ink-400 dark:bg-ink-500 animate-bounce-gentle" />
            </div>
          </div>
        </Container>
      </div>

      {/* Community features */}
      <CommunitySection />

      {/* What's Happening? hub */}
      <div className="relative border-b border-ink-200/80 bg-surface-50 dark:border-ink-800/80 dark:bg-surface-950">
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
        <Container className="relative py-16 sm:py-20">
          <ScrollFadeIn>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 8v4l3 2" /></svg>
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                What&rsquo;s Happening
              </h2>
            </div>
            <p className="max-w-2xl text-lg text-ink-500 dark:text-ink-400">
              Live events, upcoming plans, the latest news, and active polls — everything you need to jump in.
            </p>
          </ScrollFadeIn>
        </Container>
      </div>

      {/* Live Now + Upcoming events */}
      <div className="border-b border-ink-200/80 dark:border-ink-800/80">
        <Container className="py-16 sm:py-20">
          <Suspense
            fallback={
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
                  >
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="mt-3 h-3 w-1/2" />
                    <Skeleton className="mt-2 h-3 w-2/3" />
                  </div>
                ))}
              </div>
            }
          >
            <HomeEvents />
          </Suspense>
          <div className="mt-8">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
            >
              All events
              <IconArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      </div>

      {/* Latest announcements */}
      <Container className="py-16 sm:py-20">
        <Section
          title="Latest announcements"
          subtitle="Stay up to date with what's happening in the community."
        >
          <Suspense fallback={<CardGridSkeleton />}>
            <HomeAnnouncements />
          </Suspense>
          <SectionFooter href="/news" label="View all news" />
        </Section>
      </Container>

      {/* Active polls */}
      <Suspense fallback={null}>
        <HomePolls />
      </Suspense>

      {/* Community highlights */}
      <Suspense fallback={null}>
        <CommunityHighlights />
      </Suspense>

      {/* Featured staff */}
      <Container className="py-16 sm:py-20">
        <Section title="Meet the team" subtitle="The lovely humans who keep things running.">
          <Suspense fallback={<CardGridSkeleton count={6} />}>
            <HomeStaff />
          </Suspense>
          <SectionFooter href="/staff" label="Full staff directory" />
        </Section>
      </Container>

      {/* Gallery preview */}
      <Suspense fallback={null}>
        <HomeGallery />
      </Suspense>
    </>
  );
}
