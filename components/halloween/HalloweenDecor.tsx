"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HALLOWEEN_THEME_ID } from "@/lib/halloween";
import { HalloweenIcon } from "./HalloweenIcon";

/**
 * Seasonal accents that only appear while the Halloween theme is active.
 *
 * These are additive: the underlying UGN component, layout, spacing, and
 * typography are untouched. When the resolved theme is not `halloween`, each
 * component renders nothing at all.
 */
export function useIsHalloween(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setActive(html.getAttribute("data-site-theme") === HALLOWEEN_THEME_ID);
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
export function HalloweenHeroStrip() {
  const active = useIsHalloween();
  if (!active) return null;
  return (
    <div className="hw-strip mb-6 inline-flex flex-wrap items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
      <HalloweenIcon size={22} />
      <span>Halloween 2026 — trick or treat, the moderation team is watching 👻</span>
    </div>
  );
}

/** Seasonal mark in the footer. */
export function HalloweenFooterMark() {
  const active = useIsHalloween();
  if (!active) return null;
  return <HalloweenIcon size={20} className="mr-1.5 align-middle" />;
}

/** Seasonal accent for event cards. Decorative only. */
export function HalloweenEventBadge({ children }: { children?: ReactNode }) {
  const active = useIsHalloween();
  if (!active) return <>{children}</>;
  return (
    <>
      {children}
      <HalloweenIcon size={16} className="hw-event-badge" />
    </>
  );
}