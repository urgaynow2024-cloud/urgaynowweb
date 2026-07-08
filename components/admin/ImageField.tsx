"use client";

import { useState } from "react";

export function ImageField({
  label,
  value,
  onChange,
  folder = "uploads",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      {value && (
        <div className="mb-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-40 w-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif"
          id={`file-${label}`}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label
          htmlFor={`file-${label}`}
          className="btn-secondary cursor-pointer"
        >
          {uploading ? "Uploading…" : value ? "Change image" : "Upload image"}
        </label>
        {value && (
          <button type="button" className="btn-danger" onClick={() => onChange("")}>
            Remove
          </button>
        )}
        <input type="hidden" name="photoUrl" value={value} />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
