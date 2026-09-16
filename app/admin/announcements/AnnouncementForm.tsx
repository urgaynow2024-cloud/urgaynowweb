"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DiscordWebhookPanel } from "@/components/admin/DiscordWebhookPanel";

export type AnnouncementFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  state: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string;
  scheduledAt: string;
  categoryId: string;
  authorId: string;
  pinned: boolean;
  postToDiscord: boolean;
  discordRoleIds: string[];
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
  const [postToDiscord, setPostToDiscord] = useState(initial?.postToDiscord ?? false);
  const [discordRoleIds, setDiscordRoleIds] = useState<string[]>(initial?.discordRoleIds ?? []);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="coverImage" value={coverImage} />
      <input type="hidden" name="discordRoleIds" value={JSON.stringify(discordRoleIds)} />

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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="state">Status</label>
          <select id="state" name="state" className="select" defaultValue={initial?.state ?? "DRAFT"}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="publishedAt">Published date & time</label>
          <input id="publishedAt" name="publishedAt" type="datetime-local" className="input" defaultValue={initial?.publishedAt ? toLocalInput(initial.publishedAt) : ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="scheduledAt">Scheduled publish (future)</label>
          <input id="scheduledAt" name="scheduledAt" type="datetime-local" className="input" defaultValue={initial?.scheduledAt ? toLocalInput(initial.scheduledAt) : ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" className="select" defaultValue={initial?.categoryId ?? ""}>
            <option value="">— None —</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="authorId">Author (Staff)</label>
          <select id="authorId" name="authorId" className="select" defaultValue={initial?.authorId ?? ""}>
            <option value="">— None —</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
            <input type="checkbox" name="pinned" defaultChecked={initial?.pinned ?? false} className="h-4 w-4 rounded border-ink-300" />
            Pinned (show at top)
          </label>
        </div>
      </div>

      <ImageUpload label="Cover image" value={coverImage} onChange={setCoverImage} folder="news" name="coverImage" />

      <DiscordWebhookPanel
        roleIds={discordRoleIds}
        onRoleIdsChange={setDiscordRoleIds}
        postToDiscord={postToDiscord}
        onPostToDiscordChange={setPostToDiscord}
      />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save announcement</button>
      </div>
    </form>
  );
}
