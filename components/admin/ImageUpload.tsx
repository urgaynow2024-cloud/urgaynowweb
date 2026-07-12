"use client";

import { useRef, useState, type DragEvent } from "react";
import { IconUpload, IconImage, IconX, IconCheck } from "./ui/icons";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif";

export function ImageUpload({
  label,
  value,
  onChange,
  folder = "uploads",
  help,
  rounded = "rounded-2xl",
  name = "imageUrl",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  help?: string;
  rounded?: string;
  name?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      const done = await new Promise<{ ok: boolean; data: any }>((resolve) => {
        xhr.onload = () => {
          let parsed: any;
          try {
            parsed = JSON.parse(xhr.responseText);
          } catch {
            parsed = { error: "Unexpected response." };
          }
          resolve({ ok: xhr.status >= 200 && xhr.status < 300, data: parsed });
        };
        xhr.onerror = () => resolve({ ok: false, data: { error: "Network error. Please try again." } });
        xhr.send(form);
      });

      if (!done.ok) throw new Error(done.data?.error || "Upload failed. Please try again.");
      onChange(done.data.url as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10MB).");
      return;
    }
    uploadFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    handleFiles(e.dataTransfer.files);
  }

  if (value) {
    return (
      <div>
        <span className="field-label">{label}</span>
        <div className="group relative overflow-hidden border border-ink-200 dark:border-ink-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className={`h-48 w-full object-cover ${rounded}`} />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/55 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <button type="button" className="btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>
              <IconUpload size={15} /> Replace
            </button>
            <button
              type="button"
              className="btn-danger btn-sm"
              onClick={() => {
                onChange("");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <IconX size={15} /> Remove
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {help && <p className="field-help">{help}</p>}
        <input type="hidden" name={name} value={value} />
      </div>
    );
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          dragOver
            ? "border-brand-400 bg-brand-50/60 dark:bg-brand-900/20"
            : "border-ink-200 hover:border-brand-300 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800/40"
        } ${rounded}`}
      >
        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <div className="w-full max-w-xs">
            <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300">
              <IconUpload size={16} /> Uploading… {progress}%
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
              <div className="h-full rounded-full bg-brand-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-300">
              <IconImage size={22} />
            </span>
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
              <span className="text-brand-600 dark:text-brand-300">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-ink-400">PNG, JPG, GIF, WebP or AVIF · up to 10MB</p>
          </>
        )}
      </div>
      <input type="hidden" name={name} value={value} />
      {error && <p className="field-error">{error}</p>}
      {help && !error && <p className="field-help">{help}</p>}
    </div>
  );
}

export function ImageFieldHidden({ name, value }: { name: string; value: string }) {
  return <input type="hidden" name={name} value={value} />;
}

export { IconCheck };
