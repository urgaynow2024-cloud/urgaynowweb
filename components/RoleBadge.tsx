import { getRoleDefinition } from "@/lib/roles";
import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "badge-neutral",
  brand: "badge-brand",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

const dotTone: Record<Tone, string> = {
  neutral: "bg-ink-400",
  brand: "bg-brand-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const sizeClass: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

const iconForTone: Record<Tone, ReactNode> = {
  neutral: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6v7.8L12 19.7 5.5 15.7V7.9L12 4.3Z" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2 2 22h20L12 2Zm0 6 6 10H6l6-10Z" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 2 2 22h20L12 2Zm0 6 6 10H6l6-10Z" />
    </svg>
  ),
};

/**
 * Presentational role/status badge.
 *
 * This component is intentionally read-only: it receives a canonical role key
 * (or badge key) supplied by a server component and renders decoration only.
 * It never calls an API, never inspects permissions, and never grants access.
 */
export function RoleBadge({
  role,
  tooltip,
  size = "sm",
  className = "",
}: {
  role: string;
  tooltip?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const def = getRoleDefinition(role);
  const tone = def.tone ?? "neutral";
  const title = tooltip ?? def.tooltip;

  return (
    <span
      title={title}
      className={`badge inline-flex items-center rounded-full font-semibold shadow-sm ${toneClass[tone]} ${sizeClass[size]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotTone[tone]}`} aria-hidden="true" />
      {iconForTone[tone]}
      <span>{def.label}</span>
    </span>
  );
}