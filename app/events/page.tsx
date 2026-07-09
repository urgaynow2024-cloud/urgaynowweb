import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";

export const revalidate = 120;

export const metadata = {
  title: "Events",
  description: "Upcoming and past events for the Ur Gay Now community.",
};

function EventList({ events }: { events: { id: string; title: string; description: string; location: string; vrchatWorldUrl: string; coverImage: string; startDateTime: Date; endDateTime: Date | null }[] }) {
  return (
    <div className="grid gap-4">
      {events.map((e) => (
        <div key={e.id} id={e.id}>
          <EventCard event={e} />
        </div>
      ))}
    </div>
  );
}

async function EventsContent() {
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
      <h2 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-white">Upcoming</h2>
      {upcoming.length > 0 ? (
        <EventList events={upcoming} />
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No upcoming events scheduled right now — follow us on socials for announcements!
        </p>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-5 mt-12 text-2xl font-bold text-zinc-900 dark:text-white">Past events</h2>
          <EventList events={past} />
        </>
      )}
    </>
  );
}

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        description="Hang out, play, and celebrate together. Here's what's coming up."
      />
      <Container className="py-12">
        <Suspense
          fallback={
            <div className="space-y-4">
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
          <EventsContent />
        </Suspense>
      </Container>
    </>
  );
}
