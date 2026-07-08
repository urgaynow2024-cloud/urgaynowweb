"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type EventFormValues = {
  title: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  startDateTime: string;
  endDateTime: string;
  published: boolean;
};

function toLocalInput(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function EventForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: EventFormValues;
}) {
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="coverImage" value={coverImage} />

      <div>
        <label className="field-label" htmlFor="title">Title *</label>
        <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} placeholder="Event title" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="startDateTime">Start date & time *</label>
          <input id="startDateTime" name="startDateTime" type="datetime-local" className="input" required defaultValue={initial?.startDateTime ? toLocalInput(initial.startDateTime) : ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="endDateTime">End date & time (optional)</label>
          <input id="endDateTime" name="endDateTime" type="datetime-local" className="input" defaultValue={initial?.endDateTime ? toLocalInput(initial.endDateTime) : ""} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="location">Location</label>
          <input id="location" name="location" className="input" defaultValue={initial?.location ?? ""} placeholder="VRChat world or IRL venue" />
        </div>
        <div>
          <label className="field-label" htmlFor="vrchatWorldUrl">VRChat world URL</label>
          <input id="vrchatWorldUrl" name="vrchatWorldUrl" className="input" placeholder="https://vrchat.com/home/…" defaultValue={initial?.vrchatWorldUrl ?? ""} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description (Markdown)</label>
        <textarea id="description" name="description" rows={6} className="textarea font-mono text-sm" defaultValue={initial?.description ?? ""} />
      </div>

      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
          <input type="checkbox" name="published" defaultChecked={initial ? initial.published : true} className="h-4 w-4 rounded border-ink-300" />
          Published (visible on site)
        </label>
      </div>

      <ImageUpload label="Cover image" value={coverImage} onChange={setCoverImage} folder="events" name="coverImage" help="Recommended aspect ratio 16:9." />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save event</button>
      </div>
    </form>
  );
}
