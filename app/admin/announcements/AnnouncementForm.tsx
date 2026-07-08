"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type AnnouncementFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  publishedAt: string;
};

function toLocalInput(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function AnnouncementForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: AnnouncementFormValues;
}) {
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="coverImage" value={coverImage} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="title">Title *</label>
          <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} placeholder="Post title" />
        </div>
        <div>
          <label className="field-label" htmlFor="slug">Slug (URL — leave blank to auto-generate)</label>
          <input id="slug" name="slug" className="input" placeholder="my-announcement" defaultValue={initial?.slug ?? ""} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="excerpt">Excerpt (short summary)</label>
        <input id="excerpt" name="excerpt" className="input" defaultValue={initial?.excerpt ?? ""} />
      </div>

      <div>
        <label className="field-label" htmlFor="content">Content (Markdown)</label>
        <textarea id="content" name="content" rows={10} className="textarea font-mono text-sm" defaultValue={initial?.content ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="publishedAt">Publish date & time</label>
          <input id="publishedAt" name="publishedAt" type="datetime-local" className="input" defaultValue={initial?.publishedAt ? toLocalInput(initial.publishedAt) : ""} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
            <input type="checkbox" name="published" defaultChecked={initial ? initial.published : true} className="h-4 w-4 rounded border-ink-300" />
            Published (visible on site)
          </label>
        </div>
      </div>

      <ImageUpload label="Cover image" value={coverImage} onChange={setCoverImage} folder="news" name="coverImage" />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save announcement</button>
      </div>
    </form>
  );
}
