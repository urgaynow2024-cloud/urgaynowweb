"use client";

import { useState, useEffect, useRef } from "react";

function calculateTimeLeft(target: Date) {
  const total = target.getTime() - Date.now();
  if (total <= 0) return null;
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function EventCountdown({ target, label = "Starts in" }: { target: Date | string; label?: string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof calculateTimeLeft>>(null);
  const [expired, setExpired] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const intervalMs = reducedMotion ? 60000 : 1000;

  // A per-second re-render is wasted work while the countdown is scrolled out of
  // view or the tab is in the background.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let intersecting = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        setInView(entry.isIntersecting && document.visibilityState === "visible");
      },
      { threshold: 0 },
    );
    observer.observe(node);
    const onVisibility = () => {
      setInView(intersecting && document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const running = inView && !expired;

  useEffect(() => {
    if (!running) return;

    const update = () => {
      const next = calculateTimeLeft(new Date(target));
      setTimeLeft(next);
      // The target has passed: stop the timer instead of leaving a 1Hz interval
      // running for the rest of the page's life.
      if (!next) setExpired(true);
    };
    update();

    // Align to the next boundary so the display does not visibly skip a tick.
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      update();
      intervalId = setInterval(update, intervalMs);
    }, intervalMs - (Date.now() % intervalMs));

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [target, intervalMs, running]);

  if (!timeLeft) return null;

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div ref={ref} className="flex items-center gap-1.5 text-center font-mono">
      <span className="mr-1 text-xs uppercase tracking-wider opacity-60">{label}</span>
      {segments.map((s) => (
        <div key={s.label} className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider opacity-60">
            {s.label}
          </span>
          <span className="text-2xl font-bold tabular-nums">
            {String(s.value).padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}
