"use client";

import { useState } from "react";
import { ImageField } from "@/components/admin/ImageField";

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

  const handleSubmit = async (formData: FormData) => {
    if (uploading) return;
    setUploading(true);
    try {
      await action(formData);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />

      <div>
        <label className="label" htmlFor="title">Photo title</label>
        <input id="title" name="title" className="input" defaultValue={initial?.title ?? ""} required />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={initial?.description ?? ""} />
      </div>

      <ImageField label="Group photo/avatar" value={imageUrl} onChange={setImageUrl} folder={folder} />
      <ImageField label="Group banner (optional)" value={bannerUrl} onChange={setBannerUrl} folder={folder} />

      <div>
        <label className="label" htmlFor="rules">Group rules (optional)</label>
        <textarea 
          id="rules" 
          name="rules" 
          rows={6} 
          className="input" 
          defaultValue={initial?.rules ?? ""}
          placeholder="Enter your group rules here. Each rule on a new line."
        />
        <p className="mt-1 text-xs text-zinc-500">Users will be able to copy these rules with one click.</p>
      </div>

      <button 
        type="submit" 
        className="btn-primary"
        disabled={uploading}
      >
        {uploading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
