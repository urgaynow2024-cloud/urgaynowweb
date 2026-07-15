"use client";

import { useState } from "react";
import {
  INCIDENT_STATUSES,
  INCIDENT_STATUS_META,
  INCIDENT_IMPACT_META,
  type IncidentStatus,
  type IncidentImpact,
} from "@/lib/status/types";
import { statusColor } from "@/lib/status/colors";
import { StatusPill } from "@/components/status/StatusBadge";
import { formatDateTime } from "@/lib/status/format";

type Service = { id: string; name: string };

export function IncidentForm({
  services,
  action,
}: {
  services: Service[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("investigating");
  const [impact, setImpact] = useState<IncidentImpact>("minor");
  const [selected, setSelected] = useState<string[]>([]);
  const [published, setPublished] = useState(true);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", title);
    fd.set("description", description);
    fd.set("status", status);
    fd.set("impact", impact);
    fd.set("published", published ? "on" : "off");
    for (const id of selected) fd.append("serviceIds", id);
    await action(fd);
  };

  const meta = INCIDENT_STATUS_META[status];
  const c = statusColor(status);
  const impactMeta = INCIDENT_IMPACT_META[impact];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="card space-y-5 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Brief summary of the issue" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea name="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="What users are experiencing" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Initial status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as IncidentStatus)} className="select">
              {INCIDENT_STATUSES.map((s) => (
                <option key={s} value={s}>{INCIDENT_STATUS_META[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Impact</label>
            <select value={impact} onChange={(e) => setImpact(e.target.value as IncidentImpact)} className="select">
              {(Object.keys(INCIDENT_IMPACT_META) as IncidentImpact[]).map((s) => (
                <option key={s} value={s}>{INCIDENT_IMPACT_META[s].label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Affected services</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publish immediately (uncheck to save as draft and preview only)
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Create incident</button>
        </div>
      </form>

      {/* Live preview */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview</p>
        <article className={`overflow-hidden rounded-2xl border ${c.border} bg-white dark:bg-ink-900`}>
          <div className={`h-1.5 w-full ${c.bg}`} aria-hidden />
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={status} label={meta.label} />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Impact: {impactMeta.label}</span>
              <span className="ml-auto text-xs text-zinc-400">{formatDateTime(new Date())}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
              {title || "Untitled incident"}
            </h3>
            {description && <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
            {selected.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.map((id) => (
                  <span key={id} className="badge-neutral">
                    {services.find((s) => s.id === id)?.name}
                  </span>
                ))}
              </div>
            )}
            <ol className="mt-5 space-y-4">
              <li className="relative border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                <span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-semibold ${c.text}`}>{meta.label}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description || "Initial update"}</p>
              </li>
            </ol>
          </div>
        </article>
        {!published && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Draft mode: this incident will be saved but hidden from the public page until you publish it.
          </p>
        )}
      </div>
    </div>
  );
}
