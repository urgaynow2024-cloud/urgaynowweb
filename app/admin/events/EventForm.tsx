"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { dateToZonedInput } from "@/lib/event-utils";
import { DiscordWebhookPanel } from "@/components/admin/DiscordWebhookPanel";

export type EventFormValues = {
  title: string;
  summary: string;
  description: string;
  location: string;
  vrchatWorldUrl: string;
  coverImage: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  hostName: string;
  category: string;
  tags: string[];
  rules: string;
  published: boolean;
  postToDiscord: boolean;
  discordRoleIds: string[];
};

const commonTimezones = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
  "Asia/Tokyo",
];

export function EventForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: EventFormValues;
}) {
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const timezone = initial?.timezone ?? "UTC";
  const [postToDiscord, setPostToDiscord] = useState(initial?.postToDiscord ?? false);
  const [discordRoleIds, setDiscordRoleIds] = useState<string[]>(initial?.discordRoleIds ?? []);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="coverImage" value={coverImage} />
      <input type="hidden" name="discordRoleIds" value={JSON.stringify(discordRoleIds)} />

      <div>
        <label className="field-label" htmlFor="title">Title *</label>
        <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} placeholder="Event title" />
      </div>

      <div>
        <label className="field-label" htmlFor="summary">Summary</label>
        <input id="summary" name="summary" className="input" defaultValue={initial?.summary ?? ""} placeholder="A short description for cards and search" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="startDateTime">Start date & time *</label>
          <input id="startDateTime" name="startDateTime" type="datetime-local" className="input" required defaultValue={initial?.startDateTime ? dateToZonedInput(initial.startDateTime, timezone) : ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="endDateTime">End date & time (optional)</label>
          <input id="endDateTime" name="endDateTime" type="datetime-local" className="input" defaultValue={initial?.endDateTime ? dateToZonedInput(initial.endDateTime, timezone) : ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="timezone">Timezone *</label>
          <input id="timezone" name="timezone" className="input" list="event-timezones" required defaultValue={timezone} placeholder="Europe/London" />
          <datalist id="event-timezones">
            {commonTimezones.map((item) => <option key={item} value={item} />)}
          </datalist>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="hostName">Host</label>
          <input id="hostName" name="hostName" className="input" defaultValue={initial?.hostName ?? ""} placeholder="Host or organizing team" />
        </div>
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <input id="category" name="category" className="input" list="event-categories" defaultValue={initial?.category ?? "Other"} placeholder="Community" />
          <datalist id="event-categories">
            {["Community", "VRChat", "Gaming", "Social", "Contest", "Creator", "Support", "Workshop", "Party", "Other"].map((item) => <option key={item} value={item} />)}
          </datalist>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="tags">Tags</label>
        <input id="tags" name="tags" className="input" defaultValue={initial?.tags.join(", ") ?? ""} placeholder="LGBTQ+, newcomers, music" />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Separate tags with commas.</p>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description (Markdown)</label>
        <textarea id="description" name="description" rows={6} className="textarea font-mono text-sm" defaultValue={initial?.description ?? ""} />
      </div>

      <div>
        <label className="field-label" htmlFor="rules">Rules / expectations (Markdown)</label>
        <textarea id="rules" name="rules" rows={4} className="textarea font-mono text-sm" defaultValue={initial?.rules ?? ""} />
      </div>

      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
          <input type="checkbox" name="published" defaultChecked={initial ? initial.published : true} className="h-4 w-4 rounded border-ink-300" />
          Published (visible on site)
        </label>
      </div>

      <ImageUpload label="Cover image" value={coverImage} onChange={setCoverImage} folder="events" name="coverImage" help="Recommended aspect ratio 16:9." />

      <DiscordWebhookPanel
        roleIds={discordRoleIds}
        onRoleIdsChange={setDiscordRoleIds}
        postToDiscord={postToDiscord}
        onPostToDiscordChange={setPostToDiscord}
      />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save event</button>
      </div>
    </form>
  );
}
