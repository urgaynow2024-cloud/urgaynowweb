import type { ReactNode } from "react";
import { IconTrendUp, IconTrendDown } from "./icons";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 96;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  spark,
  accent = "brand",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  trend?: number;
  spark?: number[];
  accent?: "brand" | "emerald" | "amber" | "blue" | "red";
  hint?: string;
}) {
  const accentMap = {
    brand: { from: "from-brand-500/15", text: "text-brand-600 dark:text-brand-300", spark: "#a256bb" },
    emerald: { from: "from-emerald-500/15", text: "text-emerald-600 dark:text-emerald-300", spark: "#10b981" },
    amber: { from: "from-amber-500/15", text: "text-amber-600 dark:text-amber-300", spark: "#f59e0b" },
    blue: { from: "from-blue-500/15", text: "text-blue-600 dark:text-blue-300", spark: "#3b82f6" },
    red: { from: "from-red-500/15", text: "text-red-600 dark:text-red-300", spark: "#ef4444" },
  }[accent];

  return (
    <div className="card group relative overflow-hidden p-5 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accentMap.from} to-transparent opacity-70 transition-opacity group-hover:opacity-100`} />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accentMap.from} ${accentMap.text}`}>
          {icon}
        </div>
        {typeof trend === "number" && (
          <span className={`badge ${trend >= 0 ? "badge-success" : "badge-danger"}`}>
            {trend >= 0 ? <IconTrendUp size={12} /> : <IconTrendDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <p className="eyebrow">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">{value}</p>
      </div>
      <div className="relative mt-3 flex items-end justify-between">
        {hint && <p className="text-xs text-ink-500 dark:text-ink-400">{hint}</p>}
        {spark && <Sparkline data={spark} color={accentMap.spark} />}
      </div>
    </div>
  );
}
