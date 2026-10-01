"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HALLOWEEN_SEASON, HALLOWEEN_THEME_ID } from "@/lib/halloween";
import { HalloweenIcon } from "./HalloweenIcon";

/**
 * Seasonal banner shown while the Halloween theme is active.
 *
 * Dismissible for the current browser session, keyboard reachable, and hidden
 * completely outside the Halloween season.
 */
export function SeasonalBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;

    const storageKey = "ugn-halloween-banner-dismissed";
    const dismissed = window.sessionStorage.getItem(storageKey) === "1";

    const sync = () => {
      const active = html.getAttribute("data-site-theme") === HALLOWEEN_THEME_ID;
      setVisible(active && !dismissed);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="hw-banner" role="region" aria-label="Seasonal announcement">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-sm sm:px-6 lg:px-8">
        <HalloweenIcon size={22} />
        <p className="font-semibold text-[#F5F1F7]">
          <span className="text-[#FF8A1F]">{HALLOWEEN_SEASON.name}</span> — {HALLOWEEN_SEASON.tagline}
        </p>
        <Link
          href="/report"
          className="rounded-full bg-white/15 px-3 py-1 font-semibold text-[#F5F1F7] underline-offset-2 transition hover:bg-white/25 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Report a problem
        </Link>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem("ugn-halloween-banner-dismissed", "1");
            setVisible(false);
          }}
          className="rounded-full px-2 py-1 text-xs font-medium text-[#F5F1F7]/80 underline-offset-2 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Dismiss<span className="sr-only"> the Halloween banner</span>
        </button>
      </div>
    </div>
  );
}

export default SeasonalBanner;