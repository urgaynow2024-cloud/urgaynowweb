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

export function EventCountdown({ target }: { target: Date | string }) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof calculateTimeLeft>>(null);

  useEffect(() => {
    const update = () => setTimeLeft(calculateTimeLeft(new Date(target)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!timeLeft) return null;

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5 text-center font-mono">
      {segments.map((s, i) => (
        <>
          <div
            key={s.label}
            className="flex flex-col items-center"
          >
            <span className="text-xs uppercase tracking-wider opacity-60">
              {s.label}
            </span>
            <span className="text-2xl font-bold tabular-nums">
              {String(s.value).padStart(2, "0")}
            </span>
          </div>
          {i < segments.length - 1 && (
            <span className="text-2xl font-bold text-brand-500/40">:</span>
          )}
        </>
      ))}
    </div>
  );
}
