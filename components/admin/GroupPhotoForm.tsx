"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { IconCheck } from "@/components/admin/ui/icons";

export type GroupPhotoFormValues = {
  title: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  rules: string;
};

export function GroupPhotoForm({
  action,
  initial,
  folder,
}: {
  action: (formData: FormData) => void;
  initial?: GroupPhotoFormValues;
  folder: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initial?.bannerUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    if (uploading) return;
    setUploading(true);
    setSaved(false);
    try {
      await action(formData);
      setSaved(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="title">Photo title *</label>
          <input id="title" name="title" className="input" defaultValue={initial?.title ?? ""} required placeholder="e.g. Summer Meetup 2024" />
        </div>
        <div>
          <label className="field-label" htmlFor="description">Description</label>
          <input id="description" name="description" className="input" defaultValue={initial?.description ?? ""} placeholder="Short caption" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ImageUpload label="Group photo / avatar *" value={imageUrl} onChange={setImageUrl} folder={folder} help="This is the main image shown for the group." />
        <ImageUpload label="Group banner (optional)" value={bannerUrl} onChange={setBannerUrl} folder={folder} name="bannerUrl" help="A wide banner image for the group header." />
      </div>

      <div>
        <label className="field-label" htmlFor="rules">Group rules (optional)</label>
        <textarea
          id="rules"
          name="rules"
          rows={6}
          className="textarea"
          defaultValue={initial?.rules ?? ""}
          placeholder="Enter your group rules here. Each rule on a new line."
        />
        <p className="field-help">Members will be able to copy these rules with one click.</p>
      </div>

      <div className="flex items-center gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? "Saving…" : "Save group photo"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <IconCheck size={16} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
