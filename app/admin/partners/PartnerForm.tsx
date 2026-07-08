"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export type PartnerFormValues = {
  name: string;
  logoUrl: string;
  description: string;
  link: string;
  tag: string;
  sortOrder: number;
};

const TAGS = ["Partner", "Affiliate", "Friend Community"];

export function PartnerForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: PartnerFormValues;
}) {
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="logoUrl" value={logoUrl} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="input" required defaultValue={initial?.name ?? ""} placeholder="Community or group name" />
        </div>
        <div>
          <label className="field-label" htmlFor="tag">Tag</label>
          <select id="tag" name="tag" className="select" defaultValue={initial?.tag ?? "Partner"}>
            {TAGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="link">Invite / link URL</label>
          <input id="link" name="link" className="input" defaultValue={initial?.link ?? ""} placeholder="https://discord.gg/… or https://…" />
        </div>
        <div>
          <label className="field-label" htmlFor="sortOrder">Display order</label>
          <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={initial?.sortOrder ?? 0} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Short description</label>
        <textarea id="description" name="description" rows={3} className="textarea" defaultValue={initial?.description ?? ""} placeholder="A line about this partner…" />
      </div>

      <ImageUpload label="Partner logo" value={logoUrl} onChange={setLogoUrl} folder="partners" name="logoUrl" help="Shown on the partners page." />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save partner</button>
      </div>
    </form>
  );
}
