import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { EventCard } from "@/components/EventCard";
import { safeQuery } from "@/lib/safeQuery";
import { Pagination } from "@/components/Pagination";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";
import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/Skeleton";
import { Button, Tabs } from "@/components/ui";
import { eventMatchesFilters, eventMatchesSearch, getEventState, toEventCard, type EventCardData } from "@/lib/event-utils";

export const revalidate = 30;

export const metadata = {
  title: "Events",
  description: "Upcoming, live, and past events for the Ur Gay Now community.",
};

const tabs = [
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live Now" },
  { value: "past", label: "Past Events" },
];

function EventList({ events }: { events: EventCardData[] }) {
  return (
    <StaggeredList className="grid gap-6 lg:grid-cols-2">
      {events.map((e, i) => (
        <ScrollFadeIn key={e.id} delay={i * 80}>
          <div id={e.slug}><EventCard event={e} /></div>
        </ScrollFadeIn>
      ))}
    </StaggeredList>
  );
}

function tabHref(tab: string, query: { q?: string; category?: string; tag?: string }) {
  const params = new URLSearchParams({ tab });
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.tag) params.set("tag", query.tag);
  return `/events?${params.toString()}`;
}

async function EventsContent({
  page = 1,
  tab = "upcoming",
  q = "",
  category = "",
  tag = "",
}: {
  page?: number;
  tab?: string;
  q?: string;
  category?: string;
  tag?: string;
}) {
  const PAGE_SIZE = 6;
  const now = new Date();
  const events = await safeQuery(
    () =>
      prisma.event.findMany({
        where: { published: true },
        orderBy: { startDateTime: "asc" },
      }),
    [],
  );

  const allStates = tabs.map((item) => item.value);
  const selectedTab = allStates.includes(tab) ? tab : "upcoming";
  const filtered = events
    .filter((event) => {
      const state = getEventState(event, now);
      const matchesTab =
        selectedTab === "upcoming"
          ? state === "UPCOMING"
          : selectedTab === "live"
            ? state === "LIVE"
            : state === "PAST" || state === "ARCHIVED";
      return matchesTab && eventMatchesSearch(event, q) && eventMatchesFilters(event, category, tag);
    })
    .sort((a, b) => {
      if (selectedTab === "past") return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
      return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
    });

  const counts = Object.fromEntries(
    tabs.map((item) => [
      item.value,
      events.filter((event) => {
        const state = getEventState(event, now);
        const matchesTab =
          item.value === "upcoming"
            ? state === "UPCOMING"
            : item.value === "live"
              ? state === "LIVE"
              : state === "PAST" || state === "ARCHIVED";
        return matchesTab && eventMatchesSearch(event, q) && eventMatchesFilters(event, category, tag);
      }).length,
    ]),
  ) as Record<string, number>;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const tabLabel = tabs.find((item) => item.value === selectedTab)?.label ?? "Events";

  return (
    <>
      <Tabs
        label="Event status"
        selected={selectedTab}
        className="mb-8"
        items={tabs.map((item) => ({
          label: item.label,
          href: tabHref(item.value, { q, category, tag }),
          value: item.value,
          count: counts[item.value],
        }))}
      />

      <SectionHeading>{tabLabel}</SectionHeading>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        {selectedTab === "live"
          ? "Events happening right now. Join in while the community is online."
          : selectedTab === "past"
            ? "Rewatch, revisit, and rediscover events from the community archive."
            : "Scheduled events are shown in your local view with the event timezone."}
      </p>

      {visible.length > 0 ? (
        <div className="mt-8"><EventList events={visible.map(toEventCard)} /></div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon="Calendar"
            title={selectedTab === "live" ? "Nothing live right now" : selectedTab === "past" ? "No past events yet" : "Nothing on the horizon"}
            description={selectedTab === "live" ? "Live events will appear here when they start." : selectedTab === "past" ? "Past events will remain available here after they end." : "No upcoming events scheduled right now — follow us on socials for announcements!"}
          />
        </div>
      )}

      <div className="mt-12">
        <Pagination page={safePage} totalPages={totalPages} basePath="/events" queryParams={{ tab: selectedTab, q, category, tag }} />
      </div>
    </>
  );
}

export default function EventsPage({
  searchParams,
}: {
  searchParams: { page?: string; tab?: string; q?: string; category?: string; tag?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const tab = searchParams.tab || "upcoming";
  const q = searchParams.q?.trim() || "";
  const category = searchParams.category?.trim() || "";
  const tag = searchParams.tag?.trim() || "";

  return (
    <>
      <PageHeader
        title="Events"
        description="Hang out, play, and celebrate together — from upcoming plans to live now and the community archive."
      />
      <Container className="py-16">
        <form className="mb-8 flex flex-col gap-3 sm:flex-row" method="get">
          <input type="hidden" name="tab" value={tab} />
          {category && <input type="hidden" name="category" value={category} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <div className="relative flex-1">
            <input name="q" defaultValue={q} placeholder="Search events…" className="input pl-4 pr-4" />
          </div>
          <Button type="submit">Search</Button>
          {q && <Link href={tabHref(tab, { category, tag })} className="btn-ghost">Clear</Link>}
        </form>
        <Suspense
          fallback={<CardGridSkeleton count={3} className="grid gap-6 lg:grid-cols-2" />}
        >
          <EventsContent page={page} tab={tab} q={q} category={category} tag={tag} />
        </Suspense>
      </Container>
    </>
  );
}
