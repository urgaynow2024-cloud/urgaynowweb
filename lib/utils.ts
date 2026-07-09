import "server-only";
import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export type Social = { label: string; url: string };

export function parseSocials(json: string): Social[] {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((s) => s && typeof s.url === "string" && s.url.trim() !== "")
        .map((s) => ({
          label: String(s.label ?? "").trim(),
          url: String(s.url).trim(),
        }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function stringifySocials(socials: Social[]): string {
  return JSON.stringify(
    socials.filter((s) => s.url && s.url.trim() !== "").map((s) => ({ label: s.label, url: s.url })),
  );
}
