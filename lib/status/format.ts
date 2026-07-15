// Timezone-aware formatting for status timestamps.
//
// Status timestamps MUST clearly state their timezone (accuracy requirement).
// We format with an explicit timezone so the output is identical on the server
// and the client (no hydration mismatch) and unambiguous to visitors.

export const STATUS_TIMEZONE =
  process.env.STATUS_TIMEZONE?.trim() || "Europe/London";

/** Short, human-readable timezone label, e.g. "BST" or "UTC". */
export function tzAbbrev(date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: STATUS_TIMEZONE,
      timeZoneName: "short",
    }).formatToParts(date);
    return parts.find((p) => p.type === "timeZoneName")?.value ?? STATUS_TIMEZONE;
  } catch {
    return STATUS_TIMEZONE;
  }
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: STATUS_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: STATUS_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
};

const DAY_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: STATUS_TIMEZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
};

/** "Jul 15, 2026, 19:40 BST" — full, timezone-labelled. */
export function formatDateTime(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-GB", DATE_OPTS).format(date) + ` ${tzAbbrev(date)}`;
}

/** "19:40 BST" — time only, timezone-labelled. */
export function formatTime(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-GB", TIME_OPTS).format(date) + ` ${tzAbbrev(date)}`;
}

/** "Jul 15, 2026" — day only. */
export function formatDay(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-GB", DAY_OPTS).format(date);
}

/** "Jul 15, 2026" plus the timezone label. */
export function formatDayWithTz(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-GB", DAY_OPTS).format(date) + ` (${tzAbbrev(date)})`;
}

/** "3h ago" style relative label, computed against now. */
export function timeAgo(d: Date | string | number): string {
  const date = d instanceof Date ? d : new Date(d);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
