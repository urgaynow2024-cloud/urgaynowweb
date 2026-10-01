"use client";

import { useEffect, useState } from "react";
import { HALLOWEEN_THEME_ID } from "@/lib/halloween";

/**
 * Seasonal Halloween 2026 decorations.
 *
 * Everything here is CSS/SVG only — no images, no libraries, no layout shift.
 * The layer is decorative (`aria-hidden`, `pointer-events-none`) and sits behind
 * all content so it can never cover text or controls. Nothing animates when the
 * visitor asks for reduced motion (handled in CSS).
 *
 * The component mounts inactive and only paints once the resolved site theme is
 * `halloween`, so the rest of the site pays nothing for it.
 */
export function HalloweenDecorations() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setActive(html.getAttribute("data-site-theme") === HALLOWEEN_THEME_ID);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!active) return null;

  return (
    <div className="hw-layer" aria-hidden="true">
      <div className="hw-moon" />
      <div className="hw-fog hw-fog-a" />
      <div className="hw-fog hw-fog-b" />
      <SpiderWeb className="hw-web hw-web-tl" />
      <SpiderWeb className="hw-web hw-web-tr" />
      <SpiderWeb className="hw-web hw-web-bl" />
      <div className="hw-bats">
        <Bat className="hw-bat hw-bat-1" />
        <Bat className="hw-bat hw-bat-2" />
        <Bat className="hw-bat hw-bat-3" />
      </div>
      <div className="hw-drifters" aria-hidden="true">
        <Leaf className="hw-leaf hw-leaf-1" />
        <Leaf className="hw-leaf hw-leaf-2" />
        <Leaf className="hw-leaf hw-leaf-3" />
      </div>
      <div className="hw-sparkles">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className={`hw-sparkle hw-sparkle-${index + 1}`} />
        ))}
      </div>
    </div>
  );
}

function SpiderWeb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" focusable="false">
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.75">
        {[16, 30, 44, 58, 72].map((r) => (
          <circle key={r} cx="0" cy="0" r={r} />
        ))}
        {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
          <line key={deg} x1="0" y1="0" x2="0" y2="-72" transform={`rotate(${deg})`} />
        ))}
      </g>
    </svg>
  );
}

function Bat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 32" focusable="false">
      <path
        d="M32 16c-4-6-12-8-18-6 2 2 2 4 0 6-3-1-6 0-8 2 4 0 6 1 8 3-3 0-5 1-7 3 5 0 8 2 10 4 3-2 5-4 7-6l-1 8h6l-1-8c2 2 4 4 7 6 2-2 5-4 10-4-2-2-4-3-7-3 2-2 4-3 8-3-2-2-5-3-8-2-2-2-2-4 0-6-6-2-14 0-18 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false">
      <path
        d="M12 2c6 4 8 10 6 16-6-2-10-6-12-12 0-2 2-3 6-4Z"
        fill="currentColor"
        opacity="0.75"
      />
      <path d="M4 22 20 2" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

export default HalloweenDecorations;