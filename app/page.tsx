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

// Render fresh on every request so admin edits appear immediately. (Previously
// `export const revalidate = 120` which let a static/edge cache serve stale HTML
// after admin saves.)
export const dynamic = "force-dynamic";

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
      <p className="mt-6 max-w-2xl text-pretty text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {lead}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/events" className="btn-primary">See upcoming events</Link>
        <Link href="/about" className="btn-secondary">Learn about us</Link>
        {discord && (
          <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Join our Discord
          </a>
        )}
        {vrchat && (
          <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            VRChat Group
          </a>
        )}
      </div>
    </>
  );
}

async function HomeAnnouncements() {
  const now = new Date();
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
  ) : (
    <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
      No announcements yet.
    </p>
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
  ) : (
    <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
      No upcoming events scheduled right now.
    </p>
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
  ) : (
    <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
      No team members yet.
    </p>
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
    <div className="bg-zinc-50 dark:bg-zinc-900/40">
      <Container>
        <Section title="From the community" subtitle="Snapshots of our favourite moments.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallery.map((g) => (
              <div key={g.id} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={g.imageUrl}
                  alt={g.title}
                  width={400}
                  height={400}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/gallery" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Open the gallery →
            </Link>
          </div>
        </Section>
      </Container>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero — static shell paints immediately (LCP), copy/buttons stream in */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-pride-gradient-soft via-white to-brand-50/30 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-brand-950/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNC0xNHoiIGZpbGw9IiM3NTA3ODciIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-50 dark:opacity-20" />
        <Container className="relative py-20 sm:py-32">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80 dark:text-brand-200">
              🏳️‍🌈 LGBTQ+ friendly community
            </p>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl sm:leading-tight">
              Welcome to <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 bg-clip-text text-transparent">Ur Gay Now</span>
            </h1>
            <Suspense
              fallback={
                <div className="mt-6 max-w-2xl space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-64" />
                </div>
              }
            >
              <HeroContent />
            </Suspense>
          </div>
        </Container>
      </div>

      {/* Latest announcements */}
      <Container>
        <Section
          title="Latest announcements"
          subtitle="Stay up to date with what's happening in the community."
        >
          <Suspense fallback={<CardGridSkeleton />}>
            <HomeAnnouncements />
          </Suspense>
          <div className="mt-6">
            <Link href="/news" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              View all news →
            </Link>
          </div>
        </Section>
      </Container>

      {/* Upcoming events */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40">
        <Container>
          <Section title="Upcoming events" subtitle="Come hang out with us soon.">
            <Suspense
              fallback={
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
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
            <div className="mt-6">
              <Link href="/events" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                All events →
              </Link>
            </div>
          </Section>
        </Container>
      </div>

      {/* Featured staff */}
      <Container>
        <Section title="Meet the team" subtitle="The lovely humans who keep things running.">
          <Suspense fallback={<CardGridSkeleton count={6} />}>
            <HomeStaff />
          </Suspense>
          <div className="mt-6">
            <Link href="/staff" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Full staff directory →
            </Link>
          </div>
        </Section>
      </Container>

      {/* Gallery preview */}
      <Suspense fallback={null}>
        <HomeGallery />
      </Suspense>
    </>
  );
}
