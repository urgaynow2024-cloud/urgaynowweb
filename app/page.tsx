import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/Container";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EventCard } from "@/components/EventCard";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { Skeleton, CardGridSkeleton } from "@/components/Skeleton";
import { HeroBackground, ParticlesBackground } from "@/components/HeroBackground";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { IconVrchat, IconDiscord, IconCalendar, IconImages, IconUsers, IconSparkles, IconArrowRight } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 60;

async function HeroContent() {
  const [intro, tagline, discord, vrchat] = await safeQuery(
    () =>
      Promise.all([
        getSetting("homeIntro"),
        getSetting("siteTagline"),
        getSetting("discordInvite"),
        getSetting("vrchatGroupUrl"),
      ]),
    ["", "", "", ""],
  );
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

async function HomeAnnouncements() {
  const announcements = await safeQuery(
    () =>
      prisma.announcement.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    [],
  );

  return announcements.length > 0 ? (
    <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((a) => (
        <ScrollFadeIn key={a.id} delay={0}>
          <AnnouncementCard
            item={{
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt,
              coverImage: a.coverImage,
              publishedAt: a.publishedAt,
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
  const events = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { published: true, startDateTime: { gte: now } },
        orderBy: { startDateTime: "asc" },
        take: 3,
      }),
    [],
  );

  return events.length > 0 ? (
    <StaggeredList className="grid gap-4">
      {events.map((e, i) => (
        <ScrollFadeIn key={e.id} delay={i * 80}>
          <EventCard
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
        </ScrollFadeIn>
      ))}
    </StaggeredList>
  ) : (
    <EmptyState
      icon="📅"
      title="Nothing on the horizon"
      description="No upcoming events scheduled right now. Follow us on socials for announcements!"
    />
  );
}

async function HomeStaff() {
  const staff = await safeQuery(
    () =>
      prisma.staff.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 6,
      }),
    [],
  );

  return staff.length > 0 ? (
    <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {staff.map((s) => (
        <ScrollFadeIn key={s.id} delay={0}>
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
        orderBy: { createdAt: "desc" },
        take: 4,
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
                <div className="group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-card-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-card-premium-hover dark:border-ink-800 dark:bg-ink-900">
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
                <div className="group card-premium flex flex-col items-center p-6 text-center">
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
      <div className="relative flex min-h-[90vh] items-center overflow-hidden border-b border-ink-200/80 dark:border-ink-800/80">
        <HeroBackground />
        <ParticlesBackground />
        <Container className="relative z-10 py-24 sm:py-32 lg:py-36">
          <div className="animate-fade-in">
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

      {/* Latest announcements */}
      <Container>
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

      {/* Upcoming events */}
      <div className="border-t border-ink-200/80 dark:border-ink-800/80">
        <Container>
          <Section title="Upcoming events" subtitle="Come hang out with us soon.">
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
            <SectionFooter href="/events" label="All events" />
          </Section>
        </Container>
      </div>

      {/* Featured staff */}
      <Container>
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
