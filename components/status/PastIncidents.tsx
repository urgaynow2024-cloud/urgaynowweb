import { INCIDENT_STATUS_META, INCIDENT_IMPACT_META } from "@/lib/status/types";
import { statusColor } from "@/lib/status/colors";
import { formatDateTime, timeAgo } from "@/lib/status/format";
import { StatusPill } from "./StatusBadge";
import type { IncidentCardData } from "./IncidentCard";

function monthKey(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Past incidents grouped by month, newest first, with status colours. */
export function PastIncidents({ incidents }: { incidents: IncidentCardData[] }) {
  if (incidents.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No past incidents. All clear 🌈
      </p>
    );
  }

  const groups = new Map<string, IncidentCardData[]>();
  for (const i of incidents) {
    const key = monthKey(i.createdAt);
    const arr = groups.get(key) ?? [];
    arr.push(i);
    groups.set(key, arr);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) =>
    new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime(),
  );

  return (
    <div className="space-y-10">
      {sortedGroups.map(([month, items]) => (
        <section key={month} aria-labelledby={`past-${month}`}>
          <h3 id={`past-${month}`} className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            <span>{month}</span>
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" aria-hidden />
          </h3>
          <div className="space-y-3">
            {items.map((i) => {
              const meta = INCIDENT_STATUS_META[i.status as keyof typeof INCIDENT_STATUS_META] ?? INCIDENT_STATUS_META.resolved;
              const c = statusColor(i.status);
              const impact = INCIDENT_IMPACT_META[i.impact as keyof typeof INCIDENT_IMPACT_META];
              return (
                <details
                  key={i.id}
                  id={`incident-${i.id}`}
                  className="group rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-ink-900"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-zinc-900 dark:text-white">{i.title}</span>
                      <span className="text-xs text-zinc-400">
                        {i.services.map((s) => s.service?.name).filter(Boolean).join(", ") || "Platform"}
                      </span>
                    </span>
                    <StatusPill status={i.status} label={meta.label} />
                    <span className="hidden text-xs text-zinc-400 sm:block" title={formatDateTime(i.createdAt)}>
                      {timeAgo(i.createdAt)}
                    </span>
                    <svg className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                    {i.description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{i.description}</p>}
                    {impact && (
                      <p className="mt-2 text-xs text-zinc-400">Impact: <span className={impact.text}>{impact.label}</span></p>
                    )}
                    <ol className="mt-3 space-y-2">
                      {[...i.updates]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((u) => {
                          const um = INCIDENT_STATUS_META[u.status as keyof typeof INCIDENT_STATUS_META] ?? meta;
                          return (
                            <li key={u.id} className="border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-xs font-semibold ${statusColor(u.status).text}`}>{um.label}</span>
                                <time className="text-xs text-zinc-400" dateTime={new Date(u.createdAt).toISOString()}>
                                  {formatDateTime(u.createdAt)}
                                </time>
                              </div>
                              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{u.message}</p>
                            </li>
                          );
                        })}
                    </ol>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
