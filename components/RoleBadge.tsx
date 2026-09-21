import { getRoleDefinition } from "@/lib/roles";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

/**
 * Presentational staff/community role badge.
 *
 * Intentionally read-only: receives a canonical role key supplied by a server
 * component and renders decoration only. It never calls an API, never
 * inspects permissions, and never grants access.
 *
 * Visual design goals (see 12-Staff-Profile-Role-Tag / 13-15 in the spec):
 *  - small + clean + readable + premium (never tiny/faded/cramped)
 *  - a consistent diamond marker identifies it as a *role* (not a status/alert)
 *  - colour is a secondary cue only — the label is always rendered
 *  - strong contrast in light + dark, never pale enough to wash out
 */

/* Background + ring + text per role tone. All text colours stay well within
   WCAG contrast on their tinted backgrounds for both light and dark modes. */
const bgClass: Record<Tone, string> = {
  neutral: "bg-ink-50 text-ink-800 ring-ink-200 dark:bg-ink-800/50 dark:text-ink-100 dark:ring-ink-700",
  brand: "bg-brand-50 text-brand-900 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-100 dark:ring-brand-800",
  success: "bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-800",
  warning: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-800",
  danger: "bg-red-50 text-red-900 ring-red-200 dark:bg-red-500/15 dark:text-red-200 dark:ring-red-800",
  info: "bg-sky-50 text-sky-900 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-800",
};

const sizeClass: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

/** A single diamond (◆) path used as the role marker for every role. */
function DiamondIcon({ size = 3 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-${size} w-${size} shrink-0 fill-current`}
      aria-hidden="true"
    >
      <path d="M12 2 20 12 12 22 2 12z" />
    </svg>
  );
}

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
      className={`role-badge inline-flex items-center gap-1 rounded-full font-semibold shadow-sm ring-1 ${bgClass[tone]} ${sizeClass[size]} ${className}`}
    >
      <DiamondIcon size={size === "md" ? 4 : 3} />
      <span>{def.label}</span>
    </span>
  );
}
