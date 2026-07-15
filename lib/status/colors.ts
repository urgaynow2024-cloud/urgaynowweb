// Shared visual mapping for every status used on the status page. Kept free of
// server-only imports so both server and client components can use it.

export type StatusKey =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "unknown";

export type StatusColor = {
  hex: string;
  text: string; // tailwind text color
  bg: string; // tailwind background (solid-ish, transparent)
  border: string; // tailwind border color
  soft: string; // tailwind soft background for banners/cards
  dot: string; // tailwind bg for status dot
};

export const STATUS_COLORS: Record<StatusKey, StatusColor> = {
  operational: {
    hex: "#16a34a",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/40",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  degraded: {
    hex: "#d97706",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/40",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    dot: "bg-amber-500",
  },
  partial_outage: {
    hex: "#ea580c",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500/40",
    soft: "bg-orange-50 dark:bg-orange-500/10",
    dot: "bg-orange-500",
  },
  major_outage: {
    hex: "#dc2626",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500",
    border: "border-red-500/40",
    soft: "bg-red-50 dark:bg-red-500/10",
    dot: "bg-red-500",
  },
  maintenance: {
    hex: "#0284c7",
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500",
    border: "border-sky-500/40",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    dot: "bg-sky-500",
  },
  investigating: {
    hex: "#d97706",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/40",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    dot: "bg-amber-500",
  },
  identified: {
    hex: "#ea580c",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500/40",
    soft: "bg-orange-50 dark:bg-orange-500/10",
    dot: "bg-orange-500",
  },
  monitoring: {
    hex: "#0284c7",
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500",
    border: "border-sky-500/40",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    dot: "bg-sky-500",
  },
  resolved: {
    hex: "#16a34a",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/40",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  scheduled: {
    hex: "#0284c7",
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500",
    border: "border-sky-500/40",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    dot: "bg-sky-500",
  },
  in_progress: {
    hex: "#d97706",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/40",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    dot: "bg-amber-500",
  },
  completed: {
    hex: "#16a34a",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/40",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  unknown: {
    hex: "#9aa2b4",
    text: "text-zinc-500 dark:text-zinc-400",
    bg: "bg-zinc-400",
    border: "border-zinc-400/40",
    soft: "bg-zinc-100 dark:bg-zinc-500/10",
    dot: "bg-zinc-400",
  },
};

export function statusColor(key: string): StatusColor {
  return STATUS_COLORS[(key as StatusKey) in STATUS_COLORS ? (key as StatusKey) : "unknown"];
}
