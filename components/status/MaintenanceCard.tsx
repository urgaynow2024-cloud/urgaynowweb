import { MAINTENANCE_STATUS_META } from "@/lib/status/types";
import { statusColor } from "@/lib/status/colors";
import { formatDateTime } from "@/lib/status/format";
import { StatusPill } from "./StatusBadge";

type ServiceLink = { service?: { name: string } | null };

export type MaintenanceCardData = {
  id: string;
  title: string;
  description: string;
  status: string;
  startAt: Date | string;
  endAt: Date | string;
  createdAt: Date | string;
  updates: { id: string; message: string; createdAt: Date | string }[];
  services: ServiceLink[];
};

/** Scheduled-maintenance card with window, status and progress updates. */
export function MaintenanceCard({ m, anchorId }: { m: MaintenanceCardData; anchorId?: string }) {
  const meta = MAINTENANCE_STATUS_META[m.status as keyof typeof MAINTENANCE_STATUS_META] ?? MAINTENANCE_STATUS_META.scheduled;
  const c = statusColor(m.status);
  const serviceNames = m.services.map((s) => s.service?.name).filter(Boolean) as string[];
  const timeline = [...m.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <article id={anchorId} className={`overflow-hidden rounded-2xl border ${c.border} bg-white dark:bg-ink-900`}>
      <div className={`h-1.5 w-full ${c.bg}`} aria-hidden />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={m.status} label={meta.label} />
          <span className="ml-auto text-xs text-zinc-400">Posted {formatDateTime(m.createdAt)}</span>
        </div>

        <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">{m.title}</h3>
        {m.description && (
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{m.description}</p>
        )}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-ink-800/60">
            <dt className="text-xs text-zinc-400">Scheduled start</dt>
            <dd className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">{formatDateTime(m.startAt)}</dd>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-ink-800/60">
            <dt className="text-xs text-zinc-400">Scheduled end</dt>
            <dd className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">{formatDateTime(m.endAt)}</dd>
          </div>
        </dl>

        {serviceNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs text-zinc-400">Affected:</span>
            {serviceNames.map((n) => (
              <span key={n} className="badge-neutral">{n}</span>
            ))}
          </div>
        )}

        {timeline.length > 0 && (
          <>
            <h4 className="mt-5 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Updates</h4>
            <ol className="space-y-3">
              {timeline.map((u, idx) => (
                <li key={u.id} className="border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                  <time className="text-xs text-zinc-400" dateTime={new Date(u.createdAt).toISOString()}>
                    {formatDateTime(u.createdAt)}
                  </time>
                  {idx === 0 && <span className="badge-brand ml-2">Latest</span>}
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{u.message}</p>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </article>
  );
}
