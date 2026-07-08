"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type ImageItemFormValues = {
  title: string;
  description: string;
  imageUrl: string;
};

export function ImageItemForm({
  action,
  initial,
  folder = "gallery",
  titleLabel = "Title",
}: {
  action: (formData: FormData) => void;
  initial?: ImageItemFormValues;
  folder?: string;
  titleLabel?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <label className="field-label" htmlFor="title">{titleLabel}</label>
        <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} />
      </div>
      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={initial?.description ?? ""} />
      </div>

      <ImageUpload label="Image" value={imageUrl} onChange={setImageUrl} folder={folder} name="imageUrl" />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}
