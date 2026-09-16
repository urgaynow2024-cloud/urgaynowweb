import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  label: ReactNode;
  href: string;
  value?: string;
  count?: number;
};

export function Tabs({
  items,
  selected,
  label = "Sections",
  className = "",
}: {
  items: TabItem[];
  selected: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist" aria-label={label}>
      {items.map((item) => {
        const isSelected = item.value ? item.value === selected : item.href === selected;
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={isSelected}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950",
              isSelected
                ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-glow"
                : "bg-white text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white",
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-xs", isSelected ? "bg-white/20" : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300")}>
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
