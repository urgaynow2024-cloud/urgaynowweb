import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  IconExternal,
  IconLink,
  IconDiscord,
  IconVrchat,
  IconStar,
} from "@/components/admin/ui/icons";

export type LinkCardBadge = {
  label: string;
  tone?: "brand" | "neutral" | "success" | "warning" | "danger";
};

export type LinkCardProps = {
  href: string;
  title: string;
  icon?: string | null;
  description?: string | null;
  domain?: string | null;
  badge?: LinkCardBadge;
  featured?: boolean;
  className?: string;
  /** When true the card renders as static preview markup (no anchor / no navigation). */
  preview?: boolean;
};

const BADGE_CLASS: Record<NonNullable<LinkCardBadge["tone"]>, string> = {
  brand: "badge-brand",
  neutral: "badge-neutral",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

const ICON_SLOT = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200";

/** Resolves the `icon` field (identifier or emoji) to a glyph, no chrome. */
export function LinkGlyph({ icon, size = 22 }: { icon?: string | null; size?: number }) {
  const key = (icon || "").trim().toLowerCase();
  if (key === "discord") return <IconDiscord size={size} />;
  if (key === "vrchat") return <IconVrchat size={size} />;
  const trimmed = (icon || "").trim();
  if (trimmed && trimmed !== "link") {
    return (
      <span className="text-2xl leading-none" aria-hidden>
        {trimmed}
      </span>
    );
  }
  return <IconLink size={size} />;
}

export function LinkCard({
  href,
  title,
  icon,
  description,
  domain,
  badge,
  featured = false,
  className,
  preview = false,
}: LinkCardProps) {
  const base =
    "group flex w-full min-w-0 items-center gap-4 text-inherit no-underline transition-all";
  const padding = featured ? "p-6" : "p-5";
  const ring = featured
    ? "ring-1 ring-brand-200/50 dark:ring-brand-900/30"
    : "";

  const inner = (
    <>
      <span className="relative shrink-0">
        <span className={ICON_SLOT}>{icon ? <LinkGlyph icon={icon} size={22} /> : <span className={ICON_SLOT} />}</span>
        {featured && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-100 text-brand-700 shadow dark:bg-brand-900/40 dark:text-brand-200">
            <IconStar size={10} />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "block font-semibold text-ink-900 dark:text-white",
              featured && "text-lg",
            )}
          >
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                "badge",
                BADGE_CLASS[badge.tone ?? "neutral"],
                "text-[10px] font-semibold",
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400 line-clamp-2">
            {description}
          </p>
        )}
        {domain && (
          <p className="text-xs text-ink-400">{domain}</p>
        )}
      </div>

      <span className="shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-500 dark:text-ink-500">
        <IconExternal size={16} />
      </span>
    </>
  );

  const cls = cn("card card-hover flex items-center", padding, ring, className);

  if (preview) {
    return <div className={cn(base, cls)}>{inner}</div>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, cls)}
    >
      {inner}
    </a>
  );
}
