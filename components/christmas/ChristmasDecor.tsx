"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CHRISTMAS_THEME_ID } from "@/lib/christmas";
import { ChristmasIcon } from "./ChristmasIcon";

/**
 * Seasonal accents that only appear while the Christmas theme is active.
 *
 * These are additive: the underlying UGN component, layout, spacing, and
 * typography are untouched. When the resolved theme is not `christmas`, each
 * component renders nothing at all.
 */
export function useIsChristmas(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setActive(html.getAttribute("data-site-theme") === CHRISTMAS_THEME_ID);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  return active;
}

/**
 * Seasonal strip at the top of the homepage hero.
 */
export function ChristmasHeroStrip() {
  const active = useIsChristmas();
  if (!active) return null;
  return (
    <div className="cw-strip mb-6 inline-flex flex-wrap items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
      <ChristmasIcon size={22} />
      <span>Christmas 2026 — deck the halls, the moderation team is watching 🎄</span>
    </div>
  );
}

/** Seasonal mark in the footer. */
export function ChristmasFooterMark() {
  const active = useIsChristmas();
  if (!active) return null;
  return <ChristmasIcon size={20} className="mr-1.5 align-middle" />;
}

/** Seasonal accent for event cards. Decorative only. */
export function ChristmasEventBadge({ children }: { children?: ReactNode }) {
  const active = useIsChristmas();
  if (!active) return <>{children}</>;
  return (
    <>
      {children}
      <ChristmasIcon size={16} className="cw-event-badge" />
    </>
  );
}
