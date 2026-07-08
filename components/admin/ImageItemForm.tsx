"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

export type ImageItemFormValues = {
  title: string;
  description: string;
  imageUrl: string;
};

export function ImageItemForm({
  action,
  initial,
  folder,
  titleLabel = "Title",
}: {
  action: (formData: FormData) => void;
  initial?: ImageItemFormValues;
  folder: string;
  titleLabel?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <label className="label" htmlFor="title">{titleLabel}</label>
        <input id="title" name="title" className="input" defaultValue={initial?.title ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={initial?.description ?? ""} />
      </div>

      <ImageField label="Image" value={imageUrl} onChange={setImageUrl} folder={folder} />

      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}
