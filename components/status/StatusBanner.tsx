"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { statusColor } from "@/lib/status/colors";
import { formatDateTime } from "@/lib/status/format";

type Snapshot = {
  overall: string;
  label: string;
  emoji: string;
  generatedAt: string;
  source?: string;
  dbAvailable?: boolean;
  activeIncidents?: number;
  activeMaintenance?: number;
};

const SOURCE_LABEL: Record<string, string> = {
  db: "Live",
  live: "Live probe",
  snapshot: "Cached snapshot",
  fallback: "Degraded mode",
};

export function StatusBanner({ initial }: { initial: Snapshot }) {
  const [snap, setSnap] = useState<Snapshot>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/status/now", { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const data = (await res.json()) as Snapshot;
      setSnap(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    timer.current = setInterval(refresh, 30_000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  const c = statusColor(snap.overall);
  const source = SOURCE_LABEL[snap.source ?? "db"] ?? "Live";

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border ${c.border} ${c.soft}`}
      aria-live="polite"
    >
      <div className={`absolute inset-y-0 left-0 w-2 ${c.bg}`} aria-hidden />
      <div className="flex flex-col gap-4 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl" aria-hidden>{snap.emoji}</span>
          <div>
            <h2 className={`text-2xl font-extrabold sm:text-3xl ${c.text}`}>{snap.label}</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {snap.activeIncidents ?? 0} active incident(s) · {snap.activeMaintenance ?? 0} maintenance window(s)
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="btn-secondary btn-sm"
            aria-label="Refresh status"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <p className="text-xs text-zinc-400">
            Updated {formatDateTime(snap.generatedAt)} · {source}
            {!snap.dbAvailable && snap.source !== "db" ? " · DB unreachable" : ""}
          </p>
          {error && <p className="text-xs text-red-500">Couldn’t refresh live status.</p>}
        </div>
      </div>
    </section>
  );
}
