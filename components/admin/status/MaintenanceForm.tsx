"use client";

import { useState } from "react";
import {
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_META,
  type MaintenanceStatus,
} from "@/lib/status/types";
import { statusColor } from "@/lib/status/colors";
import { StatusPill } from "@/components/status/StatusBadge";
import { formatDateTime } from "@/lib/status/format";

type Service = { id: string; name: string };

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MaintenanceForm({
  services,
  action,
}: {
  services: Service[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("scheduled");
  const [startAt, setStartAt] = useState(toLocalInput(new Date()));
  const [endAt, setEndAt] = useState(toLocalInput(new Date(Date.now() + 3600_000)));
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
    fd.set("startAt", startAt);
    fd.set("endAt", endAt);
    fd.set("published", published ? "on" : "off");
    for (const id of selected) fd.append("serviceIds", id);
    await action(fd);
  };

  const meta = MAINTENANCE_STATUS_META[status];
  const c = statusColor(status);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="card space-y-5 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Database upgrade" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea name="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="What is being done and expected impact" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Start</label>
            <input type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Expected end</label>
            <input type="datetime-local" required value={endAt} onChange={(e) => setEndAt(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as MaintenanceStatus)} className="select">
              {MAINTENANCE_STATUSES.map((s) => (
                <option key={s} value={s}>{MAINTENANCE_STATUS_META[s].label}</option>
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
          <button type="submit" className="btn-primary">Schedule</button>
        </div>
      </form>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview</p>
        <article className={`overflow-hidden rounded-2xl border ${c.border} bg-white dark:bg-ink-900`}>
          <div className={`h-1.5 w-full ${c.bg}`} aria-hidden />
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={status} label={meta.label} />
              <span className="ml-auto text-xs text-zinc-400">{formatDateTime(new Date())}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">{title || "Untitled maintenance"}</h3>
            {description && <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-ink-800/60">
                <dt className="text-xs text-zinc-400">Scheduled start</dt>
                <dd className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">{startAt ? formatDateTime(new Date(startAt)) : "—"}</dd>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-ink-800/60">
                <dt className="text-xs text-zinc-400">Scheduled end</dt>
                <dd className="mt-0.5 text-sm font-medium text-zinc-800 dark:text-zinc-100">{endAt ? formatDateTime(new Date(endAt)) : "—"}</dd>
              </div>
            </dl>
            {selected.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-xs text-zinc-400">Affected:</span>
                {selected.map((id) => (
                  <span key={id} className="badge-neutral">{services.find((s) => s.id === id)?.name}</span>
                ))}
              </div>
            )}
          </div>
        </article>
        {!published && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Draft mode: this window will be saved but hidden from the public page until you publish it.
          </p>
        )}
      </div>
    </div>
  );
}
