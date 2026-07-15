import { INCIDENT_STATUS_META, INCIDENT_IMPACT_META } from "@/lib/status/types";
import { statusColor } from "@/lib/status/colors";
import { formatDateTime, timeAgo } from "@/lib/status/format";
import { StatusPill } from "./StatusBadge";

type Update = { id: string; message: string; status: string; createdAt: Date | string };
type ServiceLink = { service?: { name: string } | null };

export type IncidentCardData = {
  id: string;
  title: string;
  description: string;
  status: string;
  impact: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  updates: Update[];
  services: ServiceLink[];
};

/**
 * Active-incident panel. Shows the current phase, description, affected
 * services and a timeline with the NEWEST update first.
 */
export function IncidentCard({
  incident,
  anchorId,
}: {
  incident: IncidentCardData;
  anchorId?: string;
}) {
  const meta = INCIDENT_STATUS_META[incident.status as keyof typeof INCIDENT_STATUS_META] ??
    INCIDENT_STATUS_META.investigating;
  const impact = INCIDENT_IMPACT_META[incident.impact as keyof typeof INCIDENT_IMPACT_META];
  const c = statusColor(incident.status);
  const timeline = [...incident.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const serviceNames = incident.services.map((s) => s.service?.name).filter(Boolean) as string[];

  return (
    <article
      id={anchorId}
      className={`overflow-hidden rounded-2xl border ${c.border} bg-white dark:bg-ink-900`}
    >
      <div className={`h-1.5 w-full ${c.bg}`} aria-hidden />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={incident.status} label={meta.label} />
          {impact && <span className="text-xs text-zinc-500 dark:text-zinc-400">Impact: {impact.label}</span>}
          <span className="ml-auto text-xs text-zinc-400" title={formatDateTime(incident.updatedAt)}>
            Updated {timeAgo(incident.updatedAt)}
          </span>
        </div>

        <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">{incident.title}</h3>
        {incident.description && (
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
            {incident.description}
          </p>
        )}

        {serviceNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {serviceNames.map((n) => (
              <span key={n} className="badge-neutral">{n}</span>
            ))}
          </div>
        )}

        <h4 className="mt-5 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Timeline
        </h4>
        <ol className="space-y-4">
          {timeline.map((u, idx) => {
            const um = INCIDENT_STATUS_META[u.status as keyof typeof INCIDENT_STATUS_META] ?? meta;
            const uc = statusColor(u.status);
            return (
              <li key={u.id} className="relative border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                <span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${uc.dot}`} aria-hidden />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-semibold ${uc.text}`}>{um.label}</span>
                  <time className="text-xs text-zinc-400" dateTime={new Date(u.createdAt).toISOString()} title={formatDateTime(u.createdAt)}>
                    {formatDateTime(u.createdAt)}
                  </time>
                  {idx === 0 && (
                    <span className="badge-brand ml-auto">Latest</span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{u.message}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
