"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";

export type ShopDesignFormValues = {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imageAlt: string;
  galleryUrls: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export function ShopDesignForm({
  action,
  initial,
  categories,
  folder = "shop",
}: {
  action: (formData: FormData) => void;
  initial?: ShopDesignFormValues;
  categories: string[];
  folder?: string;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initial?.galleryUrls ?? []);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      {/* galleryUrls are submitted via hidden inputs inside MultiImageUpload */}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">Design name *</label>
          <input
            id="name"
            name="name"
            className="input"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. Pride Heart T-Shirt"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            className="input"
            list="shop-categories"
            defaultValue={initial?.category ?? ""}
            placeholder="T-shirts, Hoodies, Outfits…"
          />
          <datalist id="shop-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          defaultValue={initial?.description ?? ""}
          placeholder="Short description of the design."
        />
      </div>

      <ImageUpload
        label="Main image *"
        value={imageUrl}
        onChange={setImageUrl}
        folder={folder}
        name="imageUrl"
        help="This is the primary image shown for the design."
      />

      <MultiImageUpload
        label="Gallery images (optional)"
        values={galleryUrls}
        onChange={setGalleryUrls}
        folder={folder}
        help="Add extra angles, colourways, or close-ups. Visitors can browse them all in the lightbox."
      />

      <div>
        <label className="field-label" htmlFor="imageAlt">Image alt text (accessibility)</label>
        <input
          id="imageAlt"
          name="imageAlt"
          className="input"
          defaultValue={initial?.imageAlt ?? ""}
          placeholder="Describe the main image for screen readers"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-ink-200">
          <input
            type="checkbox"
            name="featured"
            value="on"
            defaultChecked={initial?.featured ?? false}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500 dark:border-ink-600 dark:bg-ink-800"
          />
          Featured design
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-ink-700 dark:text-ink-200">
          <input
            type="checkbox"
            name="published"
            value="on"
            defaultChecked={initial?.published ?? true}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500 dark:border-ink-600 dark:bg-ink-800"
          />
          Published (visible to visitors)
        </label>
      </div>

      <div>
        <label className="field-label" htmlFor="sortOrder">Display order</label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          className="input w-32"
          defaultValue={initial?.sortOrder ?? 0}
        />
        <p className="field-help">Lower numbers appear first. Featured designs are always shown near the top.</p>
      </div>

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save design</button>
      </div>
    </form>
  );
}
