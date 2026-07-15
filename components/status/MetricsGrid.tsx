"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { StatusChart } from "./StatusChart";
import { METRIC_DEFS } from "@/lib/status/metric-defs";

type ApiPoint = {
  timestamp: string;
  value: number;
  sampleCount: number;
  p95: number | null;
  p75: number | null;
  p50: number | null;
  successCount: number;
  failureCount: number;
};

type ApiMetric = {
  key: string;
  label: string;
  unit: string;
  statistic: string;
  lastUpdatedAt: string | null;
  stale: boolean;
  points: ApiPoint[];
};

type ApiResponse = {
  generatedAt: string;
  range: string;
  interval: string;
  environment: string;
  metrics: Record<string, ApiMetric>;
};

type Range = "1h" | "6h" | "24h" | "7d";
type Interval = "1m" | "5m" | "1h";

const RANGES: { label: string; value: Range }[] = [
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
];

const INTERVALS: { label: string; value: Interval }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "1h", value: "1h" },
];

function EmptyState({ hint, specificMessage }: { hint: string; specificMessage?: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
      <span className="text-2xl" aria-hidden>📡</span>
      <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {specificMessage || "No monitoring data available"}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function RangeControls({
  range,
  interval,
  onRangeChange,
  onIntervalChange,
}: {
  range: Range;
  interval: Interval;
  onRangeChange: (r: Range) => void;
  onIntervalChange: (i: Interval) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => onRangeChange(r.value)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              range === r.value
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        {INTERVALS.map((i) => (
          <button
            key={i.value}
            onClick={() => onIntervalChange(i.value)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              interval === i.value
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {i.value}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MetricsGrid() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("24h");
  const [interval, setIntervalState] = useState<Interval>("5m");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchMetrics = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    if (!mountedRef.current) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/status/metrics?range=${range}&interval=${interval}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (mountedRef.current) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current && !controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setUpdating(false);
      }
    }
  }, [range, interval]);

  useEffect(() => {
    mountedRef.current = true;
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, 30000);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [fetchMetrics]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchMetrics();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-ink-900">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-t-white" />
        <span className="ml-2 text-sm text-zinc-500">Loading metrics...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <RangeControls
          range={range}
          interval={interval}
          onRangeChange={setRange}
          onIntervalChange={setIntervalState}
        />
        {updating && (
          <span className="text-xs text-zinc-400">Updating...</span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {METRIC_DEFS.map((def) => {
          const apiMetric = data?.metrics[def.key];
          const points = apiMetric?.points || [];
          const hasData = points.length >= 2;

          return (
            <div
              key={def.key}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-ink-900"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{def.label}</h4>
                <span className="text-xs text-zinc-400">{def.unit}</span>
              </div>
              <div className="mt-3">
                {hasData ? (
                  <StatusChart
                    points={points.map((p) => ({
                      value: p.value,
                      timestamp: p.timestamp,
                      sampleCount: p.sampleCount,
                      p95: p.p95,
                    }))}
                    accent={def.accent}
                    unit={def.unit}
                    stale={apiMetric?.stale}
                    lastUpdatedAt={apiMetric?.lastUpdatedAt}
                  />
                ) : (
                  <EmptyState
                    hint={def.hint}
                    specificMessage={getEmptyMessage(def.key)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEmptyMessage(key: string): string {
  switch (key) {
    case "website_response_time":
      return "No homepage probe results have been recorded yet.";
    case "api_latency":
      return "No application API requests have been measured yet.";
    case "database_response_time":
      return "No database timing samples have been recorded yet.";
    case "api_request_volume":
      return "No API request volume has been recorded yet.";
    case "api_error_rate":
      return "No API requests occurred in this period.";
    case "auth_success_rate":
      return "No completed login attempts occurred in this period.";
    default:
      return "No monitoring data available";
  }
}