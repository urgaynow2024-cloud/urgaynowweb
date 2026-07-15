import type { MetricSeries } from "@/lib/status/metrics";
import { StatusChart } from "./StatusChart";

function NoDataState({ hint }: { hint: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
      <span className="text-2xl" aria-hidden>📡</span>
      <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">No monitoring data available</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

/**
 * Live metrics. Every panel is backed by REAL stored samples. When a metric has
 * no samples yet, we show an explicit empty state instead of inventing values.
 */
export function MetricsGrid({ series }: { series: MetricSeries[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {series.map((s) => (
        <div key={s.def.key} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-ink-900">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.def.label}</h4>
            <span className="text-xs text-zinc-400">{s.def.unit}</span>
          </div>
          <div className="mt-3">
            {s.points.length >= 2 ? (
              <StatusChart
                points={s.points.map((p) => ({ value: p.value, recordedAt: p.recordedAt.toISOString() }))}
                accent={s.def.accent}
                unit={s.def.unit}
              />
            ) : (
              <NoDataState hint={s.def.hint} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
