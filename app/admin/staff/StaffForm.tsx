"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Social } from "@/lib/utils";
import { IconPlus, IconX } from "@/components/admin/ui/icons";

export type StaffFormValues = {
  id?: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  sortOrder: number;
  socials: Social[];
};

export function StaffForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: StaffFormValues;
}) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [socials, setSocials] = useState<Social[]>(initial?.socials ?? []);

  function updateSocial(i: number, key: keyof Social, val: string) {
    setSocials((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  }
  function addSocial() {
    setSocials((prev) => [...prev, { label: "", url: "" }]);
  }
  function removeSocial(i: number) {
    setSocials((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="photoUrl" value={photoUrl} />
      <input type="hidden" name="socials" value={JSON.stringify(socials)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="input" required defaultValue={initial?.name ?? ""} placeholder="Full name" />
        </div>
        <div>
          <label className="field-label" htmlFor="vrchatUsername">VRChat username *</label>
          <input id="vrchatUsername" name="vrchatUsername" className="input" required defaultValue={initial?.vrchatUsername ?? ""} placeholder="username" />
        </div>
        <div>
          <label className="field-label" htmlFor="rank">Rank / role</label>
          <input id="rank" name="rank" className="input" placeholder="e.g. Admin, Moderator, Event Host" defaultValue={initial?.rank ?? ""} />
        </div>
        <div>
          <label className="field-label" htmlFor="sortOrder">Display order</label>
          <input id="sortOrder" name="sortOrder" type="number" className="input" defaultValue={initial?.sortOrder ?? 0} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="bio">Short bio</label>
        <textarea id="bio" name="bio" rows={3} className="textarea" defaultValue={initial?.bio ?? ""} placeholder="A line about this person…" />
      </div>

        <ImageUpload label="Staff photo / avatar" value={photoUrl} onChange={setPhotoUrl} folder="staff" name="photoUrl" help="Shown on the staff directory." />

      <div>
        <span className="field-label">Social / contact links</span>
        <div className="space-y-2">
          {socials.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="input w-1/3" placeholder="Label (e.g. Twitter)" value={s.label} onChange={(e) => updateSocial(i, "label", e.target.value)} />
              <input className="input flex-1" placeholder="https://…" value={s.url} onChange={(e) => updateSocial(i, "url", e.target.value)} />
              <button type="button" onClick={() => removeSocial(i)} className="btn-icon hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label="Remove link">
                <IconX size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSocial} className="btn-secondary btn-sm mt-3">
          <IconPlus size={15} /> Add link
        </button>
      </div>

      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save staff member</button>
      </div>
    </form>
  );
}
