"use client";

import { useState } from "react";

const ENDPOINT = "/api/status/now";

type Snapshot = {
  overall?: string;
  label?: string;
  emoji?: string;
  text?: string;
  updatedAt?: string;
  degraded?: boolean;
};

const STATUS_TEXT: Record<string, string> = {
  operational: "text-emerald-600 dark:text-emerald-400",
  degraded_performance: "text-amber-600 dark:text-amber-400",
  partial_outage: "text-amber-600 dark:text-amber-400",
  major_outage: "text-red-600 dark:text-red-400",
  maintenance: "text-sky-600 dark:text-sky-400",
};

export function ApiExplorer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Snapshot | null>(null);
  const [copied, setCopied] = useState(false);

  async function tryIt() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setData((await res.json()) as Snapshot);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const overall = data?.overall;
  const statusClass = overall
    ? STATUS_TEXT[overall] ?? "text-zinc-600 dark:text-zinc-300"
    : "";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded-lg bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
          GET {ENDPOINT}
        </code>
        <button
          type="button"
          onClick={tryIt}
          disabled={loading}
          className="btn-primary btn-sm"
        >
          {loading ? "Requesting…" : "Try it"}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!data}
          className="btn-secondary btn-sm"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      <div className="mt-4 min-h-[8rem]">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
        {!error && !data && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Hit “Try it” to fetch the live status snapshot.
          </p>
        )}
        {data && (
          <div>
            {data.label && (
              <div className={`mb-3 flex items-center gap-2 text-lg font-semibold ${statusClass}`}>
                <span aria-hidden>{data.emoji}</span>
                <span>{data.label}</span>
              </div>
            )}
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
