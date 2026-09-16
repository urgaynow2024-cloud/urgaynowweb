import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getEventState } from "@/lib/event-utils";
import { EventClient } from "@/components/event/EventClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; token?: string }>;
}

async function getEventData(slug: string, preview?: string, token?: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      host: {
        select: { id: true, name: true, vrchatUsername: true, photoUrl: true, rank: true },
      },
    },
  });

  if (!event) return null;

  const now = new Date();
  const state = getEventState(event as any, now);
  const isPublished = event.published === true;
  const isPreview = preview === "true" && token === `preview-${event.id}`;

  if (!isPublished && !isPreview) return null;

  // Fetch related events
  const relatedEvents = await prisma.event.findMany({
    where: {
      id: { not: event.id },
      published: true,
      OR: [
        { category: event.category },
        { tags: { hasSome: event.tags || [] } },
      ],
      startDateTime: { gte: now },
    },
    orderBy: { startDateTime: "asc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      coverImage: true,
      startDateTime: true,
      endDateTime: true,
      timezone: true,
      category: true,
      tags: true,
      hostName: true,
      location: true,
    },
  });

  // Fetch user reminders if authenticated
  let userReminders: Array<{ remindAt: string }> = [];
  const session = await getSession();
  if (session) {
    const reminders = await prisma.eventReminder.findMany({
      where: { userId: session.sub, eventId: event.id },
      select: { remindAt: true },
      orderBy: { remindAt: "asc" },
    });
    userReminders = reminders.map((r) => ({ remindAt: r.remindAt.toISOString() }));
  }

  return {
    event: {
      ...event,
      state,
      isPublished,
      isPreview,
    },
    relatedEvents,
    userReminders,
    isAdmin: !!session,
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview, token } = await searchParams;
  const data = await getEventData(slug, preview, token);

  if (!data) {
    return {
      title: "Event Not Found",
    };
  }

  const { event } = data;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Ur Gay Now";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const eventUrl = `${siteUrl}/events/${event.slug}`;

  const description = event.summary || event.description?.slice(0, 160) || `Join ${event.title} — a ${event.category?.toLowerCase() || "community"} event by Ur Gay Now.`;

  const startTime = new Date(event.startDateTime).toISOString();
  const endTime = event.endDateTime ? new Date(event.endDateTime).toISOString() : "";

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      url: eventUrl,
      siteName,
      type: "website",
      locale: "en_US",
      images: event.coverImage ? [{ url: event.coverImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: event.coverImage ? [event.coverImage] : [],
    },
    other: {
      "og:event:start_time": startTime,
      "og:event:end_time": endTime,
      "og:event:location": event.location,
      "og:event:organizer": siteName,
    },
    alternates: {
      types: {
        "text/calendar": `/api/events/${event.slug}/ics`,
      },
    },
  };
}

export default async function EventPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview, token } = await searchParams;
  const data = await getEventData(slug, preview, token);

  if (!data) {
    notFound();
  }

  const { event, relatedEvents, userReminders, isAdmin } = data;

  // Convert Date fields to ISO strings for EventClient
  const eventForClient = {
    ...event,
    startDateTime: event.startDateTime instanceof Date ? event.startDateTime.toISOString() : event.startDateTime,
    endDateTime: event.endDateTime instanceof Date ? event.endDateTime.toISOString() : event.endDateTime,
    publishedAt: event.publishedAt instanceof Date ? event.publishedAt.toISOString() : event.publishedAt,
    archivedAt: event.archivedAt instanceof Date ? event.archivedAt.toISOString() : event.archivedAt,
    createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() : event.createdAt,
    updatedAt: event.updatedAt instanceof Date ? event.updatedAt.toISOString() : event.updatedAt,
    host: event.host ? {
      ...event.host,
    } : null,
  };

  const relatedEventsForClient = relatedEvents.map((e) => ({
    ...e,
    startDateTime: e.startDateTime instanceof Date ? e.startDateTime.toISOString() : e.startDateTime,
    endDateTime: e.endDateTime instanceof Date ? e.endDateTime.toISOString() : e.endDateTime,
  }));

  return (
    <EventClient
      event={eventForClient}
      relatedEvents={relatedEventsForClient}
      userReminders={userReminders}
      isAdmin={isAdmin}
    />
  );
}