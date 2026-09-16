import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} aria-label={label}>
      {children}
    </div>
  );
}

export function FilterChip({
  active = false,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950",
        active
          ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-glow"
          : "border border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-200",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}
