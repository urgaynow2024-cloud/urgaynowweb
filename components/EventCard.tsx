"use client";

import Link from "next/link";
import { formatDateTime, formatDate } from "@/lib/client-utils";
import { EventCountdown } from "@/components/EventCountdown";

export type EventCardData = {
  id: string;
  title: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  startDateTime: Date | string;
  endDateTime: Date | string | null;
};

export function EventCard({ event }: { event: EventCardData }) {
  const start = new Date(event.startDateTime);
  const isUpcoming = start.getTime() > Date.now();
  const month = start.toLocaleString("en-GB", { month: "short" }).toUpperCase();
  const day = start.getDate();

  return (
    <article
      className="group relative flex overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-card-premium-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-brand-800/30 dark:bg-ink-900/80 dark:hover:border-brand-700/50 dark:focus-visible:ring-offset-surface-950"
    >
      {event.coverImage && (
        <div className="absolute inset-0 h-full w-full opacity-10 transition-opacity duration-500 group-hover:opacity-15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative flex w-full flex-col">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition-all duration-300 group-hover:shadow-glow-strong">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{month}</span>
            <span className="text-2xl font-extrabold leading-none">{day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                {event.title}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isUpcoming
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                }`}
              >
                {isUpcoming ? "Upcoming" : "Past"}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-300">
              {formatDateTime(event.startDateTime)}
              {event.endDateTime ? ` – ${formatDateTime(event.endDateTime)}` : ""}
            </p>
            {event.location && (
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400 flex items-center gap-1">
                <span aria-hidden>📍</span> {event.location}
              </p>
            )}
            {isUpcoming && (
              <div className="mt-2">
                <EventCountdown target={event.startDateTime} />
              </div>
            )}
            {event.description && (
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
                {event.description.replace(/[#*_`>\-]/g, "")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 p-5 pt-3 border-t border-ink-100/80 dark:border-ink-800/60">
          <Link
            href={`/events#${event.id}`}
            className="btn-primary btn-sm group/btn relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1 transition-transform group-hover/btn:translate-x-0.5">
              View Event
              <span>→</span>
            </span>
          </Link>
          {event.vrchatWorldUrl && (
            <a
              href={event.vrchatWorldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm group/btn"
            >
              <span className="flex items-center gap-1">VRChat World →</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
