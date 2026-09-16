/**
 * ICS (iCalendar) file generation for event calendar exports.
 * Compatible with Google Calendar, Outlook, Apple Calendar, and most calendar apps.
 */

export interface IcsEventParams {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date | null;
  timezone?: string | null;
  url?: string;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function formatIcsDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function foldLine(line: string): string {
  // ICS lines must be no longer than 75 octets; fold with CRLF + space
  const maxLen = 75;
  if (line.length <= maxLen) return line;
  let result = "";
  let pos = 0;
  while (pos < line.length) {
    const chunk = line.slice(pos, pos + maxLen);
    result += chunk;
    pos += maxLen;
    if (pos < line.length) result += "\r\n ";
  }
  return result;
}

export function generateIcsEvent(params: IcsEventParams): string {
  const { title, description, location, start, end, timezone, url } = params;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ur Gay Now//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:urgaynow-event-${start.getTime()}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
  ];

  if (end) {
    lines.push(`DTEND:${formatIcsDate(end)}`);
  }

  if (timezone) {
    lines.push(`X-WR-TIMEZONE:${escapeIcsText(timezone)}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(title)}`);

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }

  if (location) {
    lines.push(`LOCATION:${escapeIcsText(location)}`);
  }

  if (url) {
    lines.push(`URL:${escapeIcsText(url)}`);
  }

  // 15-minute reminder before event
  lines.push("BEGIN:VALARM");
  lines.push("TRIGGER:-PT15M");
  lines.push("ACTION:DISPLAY");
  lines.push(`DESCRIPTION:${escapeIcsText(`Reminder: ${title}`)}`);
  lines.push("END:VALARM");

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n");
}

export function downloadIcs(params: IcsEventParams): string {
  const ics = generateIcsEvent(params);
  // Return as a data URL for client-side download
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

export function getIcsFilename(params: IcsEventParams): string {
  const slug = params.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "event"}.ics`;
}