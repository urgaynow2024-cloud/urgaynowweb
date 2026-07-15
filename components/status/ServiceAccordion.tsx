"use client";

import { useState } from "react";
import { statusColor } from "@/lib/status/colors";
import { UptimeBars } from "./UptimeBars";
import { StatusPill } from "./StatusBadge";
import { formatDateTime } from "@/lib/status/format";
import type { DayStatus } from "@/lib/status/uptime";

export type ServiceRowData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  status: string;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  detail: string;
  days: DayStatus[];
  relatedIncident?: { id: string; title: string } | null;
};

function windowPct(days: DayStatus[], n: number): number | null {
  const slice = n >= days.length ? days : days.slice(days.length - n);
  const total = slice.length;
  if (total === 0) return null;
  const up = slice.filter((d) => d.status === "operational" || d.status === "maintenance").length;
  return (up / total) * 100;
}

function pctColor(p: number | null) {
  if (p === null) return "text-zinc-400";
  if (p >= 99.9) return "text-emerald-600 dark:text-emerald-400";
  if (p >= 98) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function ServiceAccordion({ service }: { service: ServiceRowData }) {
  const [open, setOpen] = useState(false);
  const c = statusColor(service.status);

  const windows: { label: string; n: number }[] = [
    { label: "24h", n: 1 },
    { label: "7d", n: 7 },
    { label: "30d", n: 30 },
    { label: "90d", n: 90 },
  ];

  return (
    <div className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`svc-${service.id}`}
        className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-ink-800/40"
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.dot}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-zinc-900 dark:text-white">{service.name}</span>
          {service.description && (
            <span className="block truncate text-sm text-zinc-500 dark:text-zinc-400">{service.description}</span>
          )}
        </span>
        <StatusPill status={service.status} label={service.status.replace("_", " ")} />
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div id={`svc-${service.id}`} className="grid gap-4 px-4 pb-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Uptime</p>
            <div className="grid grid-cols-4 gap-2">
              {windows.map((w) => {
                const p = windowPct(service.days, w.n);
                return (
                  <div key={w.label} className="rounded-xl bg-zinc-50 p-2 text-center dark:bg-ink-800/60">
                    <div className={`text-sm font-bold tabular-nums ${pctColor(p)}`}>
                      {p === null ? "—" : `${p.toFixed(1)}%`}
                    </div>
                    <div className="text-[10px] uppercase text-zinc-400">{w.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <UptimeBars days={service.days} />
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-ink-800/60">
              <span className="text-zinc-500 dark:text-zinc-400">Current latency</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {typeof service.latencyMs === "number" ? `${service.latencyMs} ms` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-ink-800/60">
              <span className="text-zinc-500 dark:text-zinc-400">Last checked</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-100" title={service.lastCheckedAt ?? ""}>
                {service.lastCheckedAt ? formatDateTime(service.lastCheckedAt) : "—"}
              </span>
            </div>
            {service.detail && (
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-ink-800/60 dark:text-zinc-400">
                {service.detail}
              </div>
            )}
            {service.relatedIncident ? (
              <a
                href={`#incident-${service.relatedIncident.id}`}
                className="block rounded-xl border border-zinc-200 px-3 py-2 text-zinc-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-brand-600"
              >
                Related incident: <span className="font-medium">{service.relatedIncident.title}</span>
              </a>
            ) : (
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-400 dark:bg-ink-800/60">
                No active incident affecting this service.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
