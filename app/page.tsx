import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, Section } from "@/components/Container";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { EventCard } from "@/components/EventCard";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tagline, intro, discord, vrchat] = await Promise.all([
    getSetting("siteTagline"),
    getSetting("homeIntro"),
    getSetting("discordInvite"),
    getSetting("vrchatGroupUrl"),
  ]);

  const now = new Date();
  const [announcements, events, staff, gallery] = await Promise.all([
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.event.findMany({
      where: { published: true, startDateTime: { gte: now } },
      orderBy: { startDateTime: "asc" },
      take: 3,
    }),
    prisma.staff.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 6 }),
    prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-pride-gradient-soft via-white to-brand-50/30 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-brand-950/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiM3NTA3ODciIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvZz48L3N2Zz4=')] opacity-50 dark:opacity-20" />
        <Container className="relative py-20 sm:py-32">
          <div className="animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/80 dark:text-brand-200">
              🏳️‍🌈 LGBTQ+ friendly community
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl sm:leading-tight">
              Welcome to <span className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 bg-clip-text text-transparent">Ur Gay Now</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {intro || tagline}
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
          </div>
        </Container>
      </div>

      {/* Latest announcements */}
      <Container>
        <Section
          title="Latest announcements"
          subtitle="Stay up to date with what's happening in the community."
        >
          {announcements.length > 0 ? (
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
          )}
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
            {events.length > 0 ? (
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
            )}
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
          {staff.length > 0 ? (
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
          )}
          <div className="mt-6">
            <Link href="/staff" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Full staff directory →
            </Link>
          </div>
        </Section>
      </Container>

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900/40">
          <Container>
            <Section title="From the community" subtitle="Snapshots of our favourite moments.">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {gallery.map((g) => (
                  <div key={g.id} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.imageUrl} alt={g.title} className="aspect-square w-full object-cover" loading="lazy" />
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
      )}
    </>
  );
}
