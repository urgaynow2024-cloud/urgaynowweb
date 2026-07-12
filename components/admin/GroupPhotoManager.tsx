"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { deleteGroupPhoto, createGroupPhotoQuick } from "@/app/admin/group-photos/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { EmptyState } from "@/components/admin/ui/Avatar";
import { Badge } from "@/components/admin/ui/Badge";
import {
  IconCamera,
  IconUpload,
  IconSearch,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@/components/admin/ui/icons";

export type GroupPhotoItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  rules: string;
  createdAt: string;
};

export function GroupPhotoManager({ items }: { items: GroupPhotoItem[] }) {
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return items.filter((g) => {
      if (query && !g.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, query]);

  async function uploadAndCreate(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10MB).");
      return;
    }
    setUploading(true);
    setProgress(0);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "group-photos");
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
      const res = await new Promise<{ ok: boolean; data: any }>((resolve) => {
        xhr.onload = () =>
          resolve({ ok: xhr.status < 300, data: (() => { try { return JSON.parse(xhr.responseText); } catch { return {}; } })() });
        xhr.onerror = () => resolve({ ok: false, data: { error: "Network error." } });
        xhr.send(form);
      });
      if (!res.ok) throw new Error(res.data?.error || "Upload failed. Please try again.");
      const quick = new FormData();
      quick.append("imageUrl", res.data.url);
      await createGroupPhotoQuick(quick);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAndCreate(file);
  }

  return (
    <div>
      {/* Dropzone + toolbar */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-6 rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${
          dragging ? "border-brand-400 bg-brand-50/60 dark:bg-brand-900/20" : "border-ink-200 dark:border-ink-700"
        }`}
      >
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-200">
              <IconUpload size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-white">
                {uploading ? `Uploading… ${progress}%` : "Drag & drop an image to upload"}
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">PNG, JPG, GIF, WebP or AVIF · up to 10MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAndCreate(e.target.files?.[0] as File)} />
            <button type="button" className="btn-secondary btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <IconUpload size={15} /> Choose file
            </button>
            <Link href="/admin/group-photos/new" className="btn-primary btn-sm">
              <IconPlus size={15} /> New
            </Link>
          </div>
        </div>
        {uploading && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-full rounded-full bg-brand-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="field-error mt-3">{error}</p>}
      </div>

      {/* Filters + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
          <span className="px-2 text-xs text-ink-400">{filtered.length}</span>
        </div>
        <div className="relative w-full sm:w-72">
          <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            className="input pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconCamera size={28} />}
          title={items.length === 0 ? "No group photos yet" : "No photos match your search"}
          description={items.length === 0 ? "Upload your first group photo to get started." : "Try adjusting your search."}
          action={items.length === 0 ? <Link href="/admin/group-photos/new" className="btn-primary"><IconPlus size={16} /> Upload photo</Link> : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((g) => (
            <div key={g.id} className="card group overflow-hidden card-hover">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 dark:bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.bannerUrl || g.imageUrl} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/55 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                  <Link href={`/admin/group-photos/${g.id}`} className="btn-secondary btn-sm"><IconEdit size={14} /> Edit</Link>
                  <ConfirmDeleteButton
                    action={deleteGroupPhoto.bind(null, g.id)}
                    message={`Delete “${g.title}”? This cannot be undone.`}
                    label="Delete"
                    className="btn-danger btn-sm"
                  />
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{g.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                  {g.rules && <Badge tone="brand">Rules</Badge>}
                  {g.bannerUrl && <Badge tone="neutral">Banner</Badge>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
