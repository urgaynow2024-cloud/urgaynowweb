"use client";

import { useEffect, useState } from "react";
import { CHRISTMAS_THEME_ID } from "@/lib/christmas";

/**
 * Seasonal Christmas 2026 decorations.
 *
 * Everything here is CSS/SVG only — no images, no libraries, no layout shift.
 * The layer is decorative (`aria-hidden`, `pointer-events-none`) and sits behind
 * all content so it can never cover text or controls. Nothing animates when the
 * visitor asks for reduced motion (handled in CSS).
 *
 * The component mounts inactive and only paints once the resolved site theme is
 * `christmas`, so the rest of the site pays nothing for it.
 */
export function ChristmasDecorations() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setActive(html.getAttribute("data-site-theme") === CHRISTMAS_THEME_ID);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div className="cw-layer" aria-hidden="true">
      <div className="cw-sky" aria-hidden="true">
        <div className="cw-stars" />
        <div className="cw-moon" />
        <div className="cw-aurora" />
        <div className="cw-fog cw-fog-a" />
        <div className="cw-fog cw-fog-b" />
      </div>

      {/* Drifting snowflakes */}
      <div className="cw-snowfall" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <Snowflake key={index} index={index + 1} />
        ))}
      </div>

      {/* Gentle snow bank drift along the bottom */}
      <div className="cw-snowbank" />

      {/* String lights drifting across the lower sky */}
      <div className="cw-lights" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <Light key={index} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

/** A single drifting snowflake. */
function Snowflake({ className, index }: { className?: string; index: number }) {
  return (
    <svg
      className={`cw-snow ${className ?? `cw-snow-${index}`}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      focusable="false"
    >
      <path d="M12 2v20M2 12h20M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

/** A single fairy light on a string. */
function Light({ className, index }: { className?: string; index: number }) {
  return (
    <svg
      className={`cw-light ${className ?? `cw-light-${index}`}`}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <circle cx="8" cy="8" r="3" fill="currentColor" opacity="0.85">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default ChristmasDecorations;
