"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarExportMenu, type CalendarEvent } from "@/components/CalendarExportMenu";
import { Markdown } from "@/components/Markdown";
import { IconShare, IconBell, IconLink, IconCheck, IconX, IconExternal, IconArrowLeft } from "@/components/admin/ui/icons";
import { Button, StatusBadge as SharedStatusBadge } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { formatEventDateTime, formatEventDate, getEventState, getEventStateClasses } from "@/lib/event-utils";
import { normalizeRoleKey } from "@/lib/roles";
import { RoleBadge } from "@/components/RoleBadge";

export interface EventPageData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string;
  startDateTime: string;
  endDateTime: string | null;
  timezone: string;
  hostId: string | null;
  hostName: string;
  host?: { id: string; name: string; vrchatUsername: string; photoUrl: string; rank?: string } | null;
  location: string;
  vrchatWorldUrl: string;
  category: string;
  tags: string[];
  rules: string;
  status: string;
  published: boolean;
  publishedAt: string | null;
  archivedAt: string | null;
  state: string;
  isPublished: boolean;
  isPreview: boolean;
}

interface EventClientProps {
  event: EventPageData;
  relatedEvents: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    coverImage: string;
    startDateTime: string;
    endDateTime: string | null;
    timezone: string;
    category: string;
    tags: string[];
    hostName: string | null;
    location: string | null;
  }>;
  userReminders: Array<{ remindAt: string }>;
  isAdmin: boolean;
}

function ReminderButton({ event, userReminders, isAdmin }: Pick<EventClientProps, "event" | "userReminders" | "isAdmin">) {
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const reminders = userReminders.map((r) => new Date(r.remindAt).getTime()).sort((a, b) => a - b);

  const handleAddReminder = useCallback(async (remindAt: Date) => {
    setLoading("add");
    try {
      const res = await fetch(`/api/events/${event.slug}/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remindAt: remindAt.toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add reminder");
      }
      toast({ title: "Reminder set", message: `We'll remind you before the event`, type: "success" });
      window.location.reload();
    } catch (err) {
      toast({ title: "Error", message: err instanceof Error ? err.message : "Failed to set reminder", type: "error" });
    } finally {
      setLoading(null);
    }
  }, [event.slug, toast]);

  const handleRemoveReminder = useCallback(async (remindAt: Date) => {
    setLoading("remove");
    try {
      const res = await fetch(`/api/events/${event.slug}/reminder?remindAt=${encodeURIComponent(remindAt.toISOString())}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove reminder");
      }
      toast({ title: "Reminder removed", type: "success" });
      window.location.reload();
    } catch (err) {
      toast({ title: "Error", message: err instanceof Error ? err.message : "Failed to remove reminder", type: "error" });
    } finally {
      setLoading(null);
    }
  }, [event.slug, toast]);

  const presetOptions = [
    { label: "1 hour before", ms: 60 * 60 * 1000 },
    { label: "1 day before", ms: 24 * 60 * 60 * 1000 },
  ];

  const hasReminders = reminders.length > 0;
  const nextReminder = reminders[0];

  if (!isAdmin && !hasReminders) {
    return (
      <Button variant="outline" onClick={() => setExpanded(true)} loading={loading === "add"}>
        <IconBell size={18} />
        Set Reminder
      </Button>
    );
  }

  if (expanded || hasReminders) {
    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        {hasReminders && (
          <div className="relative">
            <Button loading={loading === "remove"}>
              <IconBell size={18} />
              Reminder set
              {nextReminder && (
                <span className="text-xs opacity-80">
                  {new Intl.DateTimeFormat("en-GB", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(nextReminder))}
                </span>
              )}
            </Button>
            {reminders.length > 1 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-end gap-1">
                {reminders.slice(1).map((time) => (
                  <Button
                    key={time}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveReminder(new Date(time))}
                  >
                    {new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(time))}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        {!hasReminders && (
          <>
            {presetOptions.map((opt) => (
              <Button
                key={opt.label}
                variant="outline"
                size="sm"
                loading={loading === "add"}
                onClick={() => handleAddReminder(new Date(new Date(event.startDateTime).getTime() - opt.ms))}
              >
                {opt.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              <IconX size={14} /> Cancel
            </Button>
          </>
        )}
      </div>
    );
  }

  return null;
}

function ShareButton({ event, siteUrl }: { event: EventPageData; siteUrl: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl}/events/${event.slug}`;

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: event.summary || event.description,
      url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallback to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", message: "Event link copied to clipboard", type: "success" });
  };

  return (
    <Button variant="outline" onClick={handleShare} aria-label="Share event">
      <IconShare size={18} />
      {copied ? <IconCheck size={18} /> : <IconLink size={18} />}
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}

function EventStatusBadge({ state }: { state: string }) {
  const label =
    state === "LIVE" ? "Live now" :
    state === "UPCOMING" ? "Upcoming" :
    state === "ARCHIVED" ? "Archived" : "Past";
  const tone = state === "LIVE" ? "success" : state === "UPCOMING" ? "brand" : "neutral";

  return (
    <SharedStatusBadge tone={tone}>
      {label}
    </SharedStatusBadge>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="py-10 md:py-14" aria-labelledby={id ? `${id}-heading` : undefined}>
      <div className="container mx-auto px-4">
        <h2 id={`${id}-heading`} className="text-2xl md:text-3xl font-bold text-ink-900 dark:text-white mb-6">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

export function EventClient({ event, relatedEvents, userReminders, isAdmin }: EventClientProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com";
  const startDate = new Date(event.startDateTime);
  const endDate = event.endDateTime ? new Date(event.endDateTime) : null;
  const state = event.state;

  // Calendar event data for ICS
  const calendarEvent: CalendarEvent = {
    title: event.title,
    description: event.description,
    location: event.location || event.vrchatWorldUrl,
    start: startDate,
    end: endDate,
    timezone: event.timezone,
    vrchatWorldUrl: event.vrchatWorldUrl,
  };

  const vrchatUrl = event.vrchatWorldUrl;
  const isValidVrchatUrl = vrchatUrl && vrchatUrl.startsWith("https://vrchat.com/home/world/");

  return (
    <article className="min-h-screen">
      {/* Hero / Cover Image */}
      <header className="relative h-64 md:h-96 lg:h-[500px] w-full overflow-hidden">
        {event.coverImage ? (
          <>
            <Image
              src={event.coverImage}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <EventStatusBadge state={state} />
              {event.category && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                  {event.category}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl">
              {event.title}
            </h1>
            {event.isPreview && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-300 border border-amber-500/30">
                <span className="relative h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Preview mode — not published
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl -mt-4 mb-6">
        <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-300">
          <IconArrowLeft size={16} /> Back to Events
        </Link>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Meta Grid: Date, Time, Host, Location, VRChat */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800">
            <div className="shrink-0 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Date & Time</p>
              <p className="text-lg font-medium text-ink-900 dark:text-white">
                {formatEventDate(startDate, event.timezone)}
              </p>
              <p className="text-sm text-ink-500 dark:text-ink-400">
                {formatEventDateTime(startDate, event.timezone)}
                {endDate ? ` – ${formatEventDateTime(endDate, event.timezone)}` : ""}
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
                Timezone: {event.timezone}
              </p>
            </div>
          </div>

          {event.hostName && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800">
              <div className="shrink-0 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Host</p>
                {event.host ? (
                  <a
                    href={`/staff/${event.host.id}`}
                    className="flex items-center gap-2 text-lg font-medium text-ink-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {event.host.photoUrl && (
                      <Image src={event.host.photoUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                    )}
                    {event.host.name}
                    {event.host.vrchatUsername && (
                      <span className="text-sm text-ink-400 dark:text-ink-500">@{event.host.vrchatUsername}</span>
                    )}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-ink-900 dark:text-white">{event.hostName}</p>
                )}
                {event.host?.rank && (
                  <div className="mt-2">
                    <RoleBadge role={normalizeRoleKey(event.host.rank)} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800">
            <div className="shrink-0 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Location</p>
              <p className="text-lg font-medium text-ink-900 dark:text-white">
                {event.location || "Online / VRChat"}
              </p>
            </div>
          </div>

          {vrchatUrl && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800 md:col-span-2 lg:col-span-3">
              <div className="shrink-0 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm0 1.5c3.828 0 6.5 2.672 6.5 6.5S15.828 20 12 20 5.5 17.328 5.5 13.5 8.172 7 12 7zm0 1.5c-2.481 0-4.5 2.019-4.5 4.5S9.519 20 12 20s4.5-2.019 4.5-4.5S14.481 7 12 7zm0 1.5c1.93 0 3.5 1.57 3.5 3.5S13.93 15.5 12 15.5 8.5 13.93 8.5 12 10.07 8.5 12 8.5z" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">VRChat World</p>
                <a
                  href={vrchatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 mt-1 font-medium transition-colors ${isValidVrchatUrl ? "text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300" : "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"}`}
                >
                  {isValidVrchatUrl ? (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm0 1.5c3.828 0 6.5 2.672 6.5 6.5S15.828 20 12 20 5.5 17.328 5.5 13.5 8.172 7 12 7zm0 1.5c-2.481 0-4.5 2.019-4.5 4.5S9.519 20 12 20s4.5-2.019 4.5-4.5S14.481 7 12 7zm0 1.5c1.93 0 3.5 1.57 3.5 3.5S13.93 15.5 12 15.5 8.5 13.93 8.5 12 10.07 8.5 12 8.5z" /></svg>
                      Open in VRChat
                    </>
                  ) : (
                    <>
                      <IconExternal size={16} />
                      {vrchatUrl}
                    </>
                  )}
                </a>
                {!isValidVrchatUrl && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Link may not be a valid VRChat world URL
                  </p>
                )}
              </div>
            </div>
          )}

          {event.tags.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-ink-900/50 border border-ink-100 dark:border-ink-800 md:col-span-2 lg:col-span-3">
              <div className="shrink-0 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar: Calendar, Reminder, Share */}
        <div className="sticky top-2 z-20 flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-surface-50/95 dark:bg-ink-900/95 backdrop-blur border border-ink-100 dark:border-ink-800 shadow-card">
          <CalendarExportMenu event={calendarEvent} />
          <ReminderButton event={event} userReminders={userReminders} isAdmin={isAdmin} />
          <ShareButton event={event} siteUrl={siteUrl} />
        </div>

        {/* Description */}
        {event.description && (
          <Section id="description" title="Description">
            <Markdown content={event.description} />
          </Section>
        )}

        {/* Rules */}
        {event.rules && (
          <Section id="rules" title="Rules & Expectations">
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-surface-50 dark:bg-ink-900/50 p-6">
              <Markdown content={event.rules} />
            </div>
          </Section>
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <Section id="related" title="Related Events">
            <div className="grid gap-4 md:grid-cols-2">
              {relatedEvents.map((relEvent) => (
                <a
                  key={relEvent.id}
                  href={`/events/${relEvent.slug}`}
                  className="group relative flex overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-card-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-ink-900/80 dark:border-brand-800/30"
                >
                  {relEvent.coverImage ? (
                    <div className="absolute inset-0 h-full w-full overflow-hidden">
                      <Image src={relEvent.coverImage} alt="" aria-hidden fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-ink-900" />
                  )}

                  <div className="relative flex w-full flex-col">
                    <div className="flex items-start gap-4 p-5">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-glow transition-all duration-300 group-hover:shadow-glow-strong bg-gradient-to-br from-brand-500 to-brand-700">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                          {new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: relEvent.timezone }).format(new Date(relEvent.startDateTime)).toUpperCase()}
                        </span>
                        <span className="text-xl font-extrabold leading-none">
                          {new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: relEvent.timezone }).format(new Date(relEvent.startDateTime))}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                          {relEvent.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-300">
                          {formatEventDateTime(relEvent.startDateTime, relEvent.timezone)}
                          {relEvent.endDateTime ? ` – ${formatEventDateTime(relEvent.endDateTime, relEvent.timezone)}` : ""}
                        </p>
                        {(relEvent.hostName || relEvent.category) && (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                            {relEvent.hostName && <span>Host: {relEvent.hostName}</span>}
                            {relEvent.hostName && relEvent.category && <span aria-hidden>•</span>}
                            {relEvent.category && <span>{relEvent.category}</span>}
                          </div>
                        )}
                        {relEvent.location && (
                          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1">
                            <span aria-hidden>📍</span> {relEvent.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Section>
        )}
      </main>
    </article>
  );
}