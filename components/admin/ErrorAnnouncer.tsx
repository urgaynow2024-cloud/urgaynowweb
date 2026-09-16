"use client";

import { useEffect, useRef } from "react";

/**
 * Reads the `?error=1` query param (set by admin server actions) and moves
 * focus to the page's error summary so screen-reader users hear the failure
 * instead of hunting for it. Renders nothing visible.
 */
export function ErrorAnnouncer() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;

    const el = ref.current;
    if (el) {
      // Give the heading a stable, unique-ish id so it can be the skip target.
      el.setAttribute("tabindex", "-1");
      el.focus();
    }
  }, []);

  return (
    <h2
      ref={ref}
      id="page-error-summary"
      className="sr-only"
      tabIndex={-1}
      aria-live="assertive"
    >
      There was an error saving your changes. Please review the form and try again.
    </h2>
  );
}