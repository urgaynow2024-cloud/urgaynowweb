import Link from "next/link";
import { formatDateTime, formatDate } from "@/lib/utils";

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
    <article className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950">
      <div className="flex w-20 flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-inner">
        <span className="text-sm font-bold">{month}</span>
        <span className="text-3xl font-extrabold leading-none">{day}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{event.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isUpcoming
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {isUpcoming ? "Upcoming" : "Past"}
          </span>
        </div>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">
          {formatDateTime(event.startDateTime)}
          {event.endDateTime ? ` – ${formatDateTime(event.endDateTime)}` : ""}
        </p>
        {event.location && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">📍 {event.location}</p>
        )}
        {event.description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {event.description.replace(/[#*_`>\-]/g, "")}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link
            href={`/events#${event.id}`}
            className="btn-primary btn-sm"
          >
            Details
          </Link>
          {event.vrchatWorldUrl && (
            <a
              href={event.vrchatWorldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm"
            >
              VRChat World
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
