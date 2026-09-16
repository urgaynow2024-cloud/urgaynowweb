"use client";

import { useState, useEffect } from "react";

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
  const reducedMotion = useReducedMotion();
  const intervalMs = reducedMotion ? 60000 : 1000;

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeLeft(new Date(target)));
    update();
    const id = setInterval(update, intervalMs);
    return () => clearInterval(id);
  }, [target, intervalMs]);

  if (!timeLeft) return null;

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5 text-center font-mono">
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
