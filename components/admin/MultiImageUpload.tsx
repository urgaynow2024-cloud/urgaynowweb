"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { IconPlus, IconX } from "@/components/admin/ui/icons";

export function MultiImageUpload({
  label,
  values,
  onChange,
  folder = "shop",
  help,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  help?: string;
}) {
  function setAt(i: number, url: string) {
    const next = values.slice();
    next[i] = url;
    onChange(next);
  }

  function removeAt(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...values, ""]);
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      {values.length === 0 ? (
        <p className="mb-3 text-xs text-ink-400">
          No extra images yet. Add one to show more angles or variations.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {values.map((url, i) => (
          <div key={i} className="relative">
            <ImageUpload
              label={`Gallery image ${i + 1}`}
              value={url}
              onChange={(u) => setAt(i, u)}
              folder={folder}
              name="galleryUrls"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="btn-danger btn-sm absolute right-2 top-2 z-10"
                aria-label={`Remove gallery image ${i + 1}`}
              >
                <IconX size={14} /> Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn-ghost btn-sm mt-3">
        <IconPlus size={15} /> Add another image
      </button>
      {help && <p className="field-help mt-2">{help}</p>}
    </div>
  );
}

export { IconX };
