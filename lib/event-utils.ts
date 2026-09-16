export type EventState = "UPCOMING" | "LIVE" | "PAST" | "ARCHIVED";

export type EventCardSource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  tags: string[];
  startDateTime: Date | string;
  endDateTime: Date | string | null;
  hostName?: string | null;
  category?: string | null;
  timezone?: string;
  archivedAt?: Date | string | null;
};

export type EventCardData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  startDateTime: Date | string;
  endDateTime: Date | string | null;
  hostName?: string;
  category?: string;
  timezone?: string;
  archivedAt?: Date | string | null;
};

export type EventSearchSource = EventCardSource & {
  summary: string;
  tags: string[];
};

export function toEventCard(event: EventCardSource): EventCardData {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    location: event.location,
    vrchatWorldUrl: event.vrchatWorldUrl,
    coverImage: event.coverImage,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    hostName: event.hostName || undefined,
    category: event.category || undefined,
    timezone: event.timezone,
    archivedAt: event.archivedAt,
  };
}

export function eventMatchesSearch(event: EventSearchSource, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;
  return [
    event.title,
    event.summary,
    event.description,
    event.location,
    event.hostName,
    event.category,
  ].some((value) => value?.toLowerCase().includes(normalized)) ||
    event.tags.some((tag) => tag.toLowerCase().includes(normalized));
}

export function eventMatchesFilters(event: EventCardSource, category: string, tag: string): boolean {
  return (!category || event.category === category) &&
    (!tag || (event.tags?.some((value) => value.toLowerCase() === tag.toLowerCase()) ?? false));
}

export type EventTiming = {
  startDateTime: Date | string;
  endDateTime?: Date | string | null;
  archivedAt?: Date | string | null;
};

export const eventStateLabels: Record<EventState, string> = {
  UPCOMING: "Upcoming",
  LIVE: "Live Now",
  PAST: "Past Event",
  ARCHIVED: "Archived",
};

export function getEventState(event: EventTiming, now = new Date()): EventState {
  const currentTime = now.getTime();
  const start = new Date(event.startDateTime).getTime();
  if (Number.isNaN(start)) return "ARCHIVED";
  if (event.archivedAt && new Date(event.archivedAt).getTime() <= currentTime) return "ARCHIVED";
  if (start > currentTime) return "UPCOMING";
  const end = event.endDateTime == null ? null : new Date(event.endDateTime).getTime();
  if (end === null || end > currentTime) return "LIVE";
  return "PAST";
}

export function getEventStateLabel(event: EventTiming, now = new Date()): string {
  return eventStateLabels[getEventState(event, now)];
}

export function getEventStateClasses(state: EventState): string {
  switch (state) {
    case "LIVE":
      return "bg-brand-600 text-white shadow-glow";
    case "UPCOMING":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "ARCHIVED":
    case "PAST":
      return "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400";
  }
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const parts = getTimeZoneParts(date, timeZone);
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (asUTC - date.getTime()) / 60000;
}

export function zonedDateTimeToUtc(localDateTime: string, timeZone: string): Date | null {
  if (!isValidTimeZone(timeZone)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(localDateTime);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const wallTime = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const firstOffset = getTimeZoneOffset(new Date(wallTime), timeZone);
  const utcTime = wallTime - firstOffset * 60000;
  const secondOffset = getTimeZoneOffset(new Date(utcTime), timeZone);
  return new Date(wallTime - secondOffset * 60000);
}

export function dateToZonedInput(date: Date | string, timeZone: string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime()) || !isValidTimeZone(timeZone)) return "";
  const parts = getTimeZoneParts(value, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatEventDateTime(date: Date | string, timezone?: string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || undefined,
    }).format(value);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(value);
  }
}

export function formatEventDate(date: Date | string, timezone?: string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: timezone || undefined,
    }).format(value);
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(value);
  }
}

export function formatEventMonthDay(date: Date | string, timezone?: string): { month: string; day: number } {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return { month: "", day: 1 };
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      timeZone: timezone || undefined,
    }).formatToParts(value);
    return {
      month: parts.find((part) => part.type === "month")?.value ?? "",
      day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    };
  } catch {
    return { month: value.toLocaleString("en-GB", { month: "short" }).toUpperCase(), day: value.getDate() };
  }
}

export function isEventInState(event: EventTiming, state: EventState, now = new Date()): boolean {
  return getEventState(event, now) === state;
}
