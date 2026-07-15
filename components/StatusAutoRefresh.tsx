"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  overall: string;
  label: string;
  emoji: string;
  text: string;
  updatedAt: string;
};

export function StatusAutoRefresh({ initial }: { initial: Snapshot }) {
  const [snap, setSnap] = useState<Snapshot>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = async () => {
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
  };

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className={`flex items-center gap-3 text-2xl font-bold ${snap.text}`}>
        <span aria-hidden>{snap.emoji}</span>
        <span>{snap.label}</span>
      </div>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Updated {snap.updatedAt}
      </span>
      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        className="btn-secondary btn-sm"
        aria-label="Refresh status"
      >
        {loading ? "Refreshing…" : "Refresh"}
      </button>
      {error && (
        <span className="text-sm text-red-500">Couldn’t refresh live status.</span>
      )}
    </div>
  );
}
