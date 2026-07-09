import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { safeQuery } from "@/lib/safeQuery";
import { Suspense } from "react";
import { Skeleton } from "@/components/Skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events",
  description: "Upcoming and past events for the Ur Gay Now community.",
};

function EventList({ events }: { events: { id: string; title: string; description: string; location: string; vrchatWorldUrl: string; coverImage: string; startDateTime: Date; endDateTime: Date | null }[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
  const [upcoming, past] = await safeQuery(
    () =>
      Promise.all([
        prisma.event.findMany({
          where: { published: true, startDateTime: { gte: now } },
          orderBy: { startDateTime: "asc" },
        }),
        prisma.event.findMany({
          where: { published: true, startDateTime: { lt: now } },
          orderBy: { startDateTime: "desc" },
          take: 10,
        }),
      ]),
    [[], []],
  );

  return (
    <>
      <h2 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">Upcoming</h2>
      {upcoming.length > 0 ? (
        <EventList events={upcoming} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-xl text-zinc-500 dark:text-zinc-400">No upcoming events scheduled right now — follow us on socials for announcements!</p>
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-6 mt-16 text-3xl font-bold text-zinc-900 dark:text-white">Past events</h2>
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
      <Container className="py-16">
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
