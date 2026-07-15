"use client";

import { useId } from "react";

type Point = { value: number; recordedAt: string };

/**
 * Lightweight SVG area+line chart. Built from real stored metric samples only —
 * callers must not pass synthetic data. Renders nothing meaningful if fewer than
 * two points exist (the parent shows an empty state instead).
 */
export function StatusChart({
  points,
  accent,
  unit,
  height = 140,
}: {
  points: Point[];
  accent: string;
  unit: string;
  height?: number;
}) {
  const gradId = useId();
  if (points.length < 2) {
    return (
      <div
        className="flex h-[140px] items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700"
        aria-hidden
      >
        Not enough data yet
      </div>
    );
  }

  const w = 600;
  const h = height;
  const pad = 6;
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (points.length - 1);

  const pts = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((p.value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;

  const last = points[points.length - 1].value;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
          {last.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          <span className="ml-1 text-sm font-medium text-zinc-400">{unit}</span>
        </span>
        <span className="text-xs text-zinc-400">
          {points.length} samples
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${points.length} data points, latest ${last.toFixed(1)} ${unit}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
