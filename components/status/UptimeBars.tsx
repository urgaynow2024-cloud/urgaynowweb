import { statusColor } from "@/lib/status/colors";
import type { DayStatus } from "@/lib/status/uptime";
import { formatDay } from "@/lib/status/format";

/**
 * 90-day uptime bar grid (VRChat-style). Each square is one day, coloured by
 * the worst status recorded that day. Days with no data are neutral, never
 * "operational" — we never imply health we didn't measure.
 */
export function UptimeBars({ days, label }: { days: DayStatus[]; label?: string }) {
  const counts = days.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {});
  const operational = counts.operational ?? 0;
  const pct = days.length ? (operational / days.length) * 100 : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label ?? "Past 90 days"}
        </span>
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {pct.toFixed(1)}% operational
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-[3px]" role="img" aria-label={`${pct.toFixed(1)} percent operational over ${days.length} days`}>
        {days.map((d) => {
          const c = statusColor(d.status);
          return (
            <span
              key={d.date}
              title={`${formatDay(d.date)} — ${
                d.status === "unknown" ? "No data" : d.status.replace("_", " ")
              }`}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ backgroundColor: d.status === "unknown" ? "rgba(154,162,180,0.35)" : c.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}
