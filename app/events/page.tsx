import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { Markdown } from "@/components/Markdown";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events",
  description: "Upcoming and past events for the Ur Gay Now community.",
};

export default async function EventsPage() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, startDateTime: { gte: now } },
      orderBy: { startDateTime: "asc" },
    }),
    prisma.event.findMany({
      where: { published: true, startDateTime: { lt: now } },
      orderBy: { startDateTime: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Events"
        description="Hang out, play, and celebrate together. Here's what's coming up."
      />
      <Container className="py-12">
        <h2 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-white">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((e) => (
              <div key={e.id} id={e.id}>
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
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            No upcoming events scheduled right now — follow us on socials for announcements!
          </p>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mb-5 mt-12 text-2xl font-bold text-zinc-900 dark:text-white">Past events</h2>
            <div className="grid gap-4">
              {past.map((e) => (
                <div key={e.id} id={e.id} className="opacity-80">
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
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
