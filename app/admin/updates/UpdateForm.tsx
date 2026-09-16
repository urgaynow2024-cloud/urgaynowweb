"use client";

import { useState } from "react";
import { DiscordWebhookPanel } from "@/components/admin/DiscordWebhookPanel";

export type UpdateFormValues = {
  version: string;
  type: "MAJOR" | "MINOR" | "PATCH";
  title: string;
  summary: string;
  whatsNew: string;
  improvements: string;
  bugFixes: string;
  securityNotes: string;
  images: string;
  authorId: string;
  published: boolean;
  postToDiscord: boolean;
};

export function UpdateForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: UpdateFormValues;
}) {
  const [postToDiscord, setPostToDiscord] = useState(initial?.postToDiscord ?? false);
  const [discordRoleIds, setDiscordRoleIds] = useState<string[]>([]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="discordRoleIds" value={JSON.stringify(discordRoleIds)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="version">
            Version
          </label>
          <input
            id="version"
            name="version"
            required
            defaultValue={initial?.version ?? ""}
            placeholder="1.0.0"
            className="input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" defaultValue={initial?.type ?? "PATCH"} className="select">
            <option value="MAJOR">Major — breaking/large changes</option>
            <option value="MINOR">Minor — new backwards-compatible features</option>
            <option value="PATCH">Patch — fixes and small improvements</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="authorId">
            Author
          </label>
          <input
            id="authorId"
            name="authorId"
            defaultValue={initial?.authorId ?? ""}
            placeholder="Staff ID (optional)"
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="e.g. v1.2.0 — New homepage hub"
          className="input"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="summary">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={initial?.summary ?? ""}
          placeholder="One-line summary shown on the changelog card"
          className="textarea"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="whatsNew">
            What&rsquo;s New
          </label>
          <textarea
            id="whatsNew"
            name="whatsNew"
            rows={5}
            defaultValue={initial?.whatsNew ?? ""}
            placeholder="Markdown — new features and changes"
            className="textarea"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="improvements">
            Improvements
          </label>
          <textarea
            id="improvements"
            name="improvements"
            rows={5}
            defaultValue={initial?.improvements ?? ""}
            placeholder="Markdown — quality-of-life improvements"
            className="textarea"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="bugFixes">
            Bug Fixes
          </label>
          <textarea
            id="bugFixes"
            name="bugFixes"
            rows={5}
            defaultValue={initial?.bugFixes ?? ""}
            placeholder="Markdown — resolved issues"
            className="textarea"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="securityNotes">
            Security / Moderation
          </label>
          <textarea
            id="securityNotes"
            name="securityNotes"
            rows={5}
            defaultValue={initial?.securityNotes ?? ""}
            placeholder="Markdown — security and moderation notes"
            className="textarea"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="images">
          Images (JSON array of URLs)
        </label>
        <input
          id="images"
          name="images"
          defaultValue={initial?.images ?? "[]"}
          placeholder='["https://..."]'
          className="input"
        />
      </div>

      <DiscordWebhookPanel
        roleIds={discordRoleIds}
        onRoleIdsChange={setDiscordRoleIds}
        postToDiscord={postToDiscord}
        onPostToDiscordChange={setPostToDiscord}
      />

      <div className="flex items-center gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
          <input
            type="checkbox"
            name="published"
            checked={initial?.published ?? false}
            className="h-4 w-4 rounded border-ink-300"
          />
          Publish
        </label>
        <span className="text-xs text-ink-400">Uncheck to save as a draft.</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Save update</button>
      </div>
    </form>
  );
}