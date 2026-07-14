"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconUpload, IconImage, IconX, IconCheck, IconSpinner } from "@/components/admin/ui/icons";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

type Status = "idle" | "uploading" | "submitting" | "success" | "error";

export function GallerySubmissionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function chooseFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File is too large (max 10MB).");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (status === "submitting" || status === "uploading") return;
    chooseFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = formRef.current;
    if (!form) return;
    if (!file) {
      setError("Please choose an image to upload.");
      return;
    }

    const getValue = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value || "";

    const title = getValue("title");
    const description = getValue("description");
    const submitterName = getValue("submitterName");
    const website = getValue("website");

    setStatus("submitting");
    setProgress(0);

    try {
      // 1) Ask the server for a short-lived, scoped presigned PUT URL.
      const pathname = `gallery-submissions/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${file.name}`;
      const presignRes = await fetch("/api/blob", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pathname, contentType: file.type }),
      });
      const presignData = await presignRes
        .json()
        .catch(() => ({ error: "Could not prepare the upload." }));
      if (!presignRes.ok || !presignData.url) {
        throw new Error(presignData.error || "Could not prepare the upload.");
      }

      // 2) Upload the image directly from the browser to Vercel Blob.
      //    This avoids the serverless request-body size limit.
      const blobUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignData.url);
        xhr.setRequestHeader("content-type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText).url);
            } catch {
              reject(new Error("Unexpected response from storage."));
            }
          } else {
            reject(new Error("Upload failed. Please try again."));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(file);
      });

      // 3) Submit the resulting URL + metadata to create a pending record.
      const res = await fetch("/api/gallery/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageUrl: blobUrl, title, description, submitterName, website }),
      });
      const data = await res.json().catch(() => ({ error: "Unexpected response." }));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setStatus("success");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Submission failed. Please try again.";
      setError(message);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <IconCheck size={28} />
        </span>
        <h2 className="text-xl font-bold text-ink-900 dark:text-white">Thanks for sharing!</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-600 dark:text-ink-300">
          Your photo has been submitted and is now awaiting review by a moderator. Once
          approved, it will appear in the gallery.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/gallery" className="btn-secondary btn-sm">Back to gallery</a>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => {
              setStatus("idle");
              setFile(null);
              setPreview(null);
              setProgress(0);
              formRef.current?.reset();
            }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  const busy = status === "submitting" || status === "uploading";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="card space-y-6 p-6">
      <input type="hidden" name="website" autoComplete="off" tabIndex={-1} />

      <div>
        <label className="field-label" htmlFor="submitterName">Your name <span className="text-ink-400">(optional)</span></label>
        <input id="submitterName" name="submitterName" className="input" placeholder="How should we credit you?" />
      </div>

      <div>
        <label className="field-label" htmlFor="title">Title <span className="text-ink-400">(optional)</span></label>
        <input id="title" name="title" className="input" maxLength={120} placeholder="e.g. Sunset meetup" />
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description <span className="text-ink-400">(optional)</span></label>
        <textarea id="description" name="description" rows={3} className="input" maxLength={500} placeholder="Tell us a little about this moment." />
      </div>

      <div>
        <span className="field-label">Photo <span className="text-red-500">*</span></span>
        {preview ? (
          <div className="group relative overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/55 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
              <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
                <IconUpload size={15} /> Replace
              </button>
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                disabled={busy}
              >
                <IconX size={15} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !busy && fileRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
              dragOver
                ? "border-brand-400 bg-brand-50/60 dark:bg-brand-900/20"
                : "border-ink-200 hover:border-brand-300 hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800/40"
            } rounded-2xl`}
          >
            <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} />
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-300">
              <IconImage size={22} />
            </span>
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
              <span className="text-brand-600 dark:text-brand-300">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-ink-400">PNG, JPG, GIF, WebP or AVIF · up to 10MB</p>
          </div>
        )}
      </div>

      {busy && (
        <div className="w-full">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300">
            <IconSpinner size={16} /> Submitting… {progress}%
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div className="h-full rounded-full bg-brand-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="field-error">{error}</p>
      )}

      <div className="flex items-center gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <a href="/gallery" className="btn-ghost">Cancel</a>
      </div>

      <p className="text-xs text-ink-400">
        By submitting, you confirm you have the right to share this photo. Submissions are
        reviewed by a moderator before appearing publicly.
      </p>
    </form>
  );
}
