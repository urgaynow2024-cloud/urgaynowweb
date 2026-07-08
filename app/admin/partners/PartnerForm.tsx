"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Social } from "@/lib/utils";
import { IconPlus, IconX } from "@/components/admin/ui/icons";

export type PartnerFormValues = {
  name: string;
  logoUrl: string;
  description: string;
  links: Social[];
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
  const [links, setLinks] = useState<Social[]>(initial?.links ?? []);

  function updateLink(i: number, key: keyof Social, val: string) {
    setLinks((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  }
  function addLink() {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  }
  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="links" value={JSON.stringify(links)} />

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
          <label className="field-label" htmlFor="sortOrder">Display order</label>
          <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={initial?.sortOrder ?? 0} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">Short description</label>
        <textarea id="description" name="description" rows={3} className="textarea" defaultValue={initial?.description ?? ""} placeholder="A line about this partner…" />
      </div>

      <div>
        <span className="field-label">Links (with a name for what each is for)</span>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input className="input w-1/3" placeholder="Label (e.g. Discord)" value={l.label} onChange={(e) => updateLink(i, "label", e.target.value)} />
              <input className="input flex-1" placeholder="https://…" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} />
              <button type="button" onClick={() => removeLink(i)} className="btn-icon hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label="Remove link">
                <IconX size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLink} className="btn-secondary btn-sm mt-3">
          <IconPlus size={15} /> Add link
        </button>
      </div>

      <ImageUpload label="Partner logo" value={logoUrl} onChange={setLogoUrl} folder="partners" name="logoUrl" help="Shown on the partners page." />

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save partner</button>
      </div>
    </form>
  );
}
