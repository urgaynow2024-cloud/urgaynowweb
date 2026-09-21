"use client";

import { useEffect, useTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { Social } from "@/lib/utils";
import { IconAlert, IconPlus, IconX } from "@/components/admin/ui/icons";
import { STAFF_ROLES } from "@/lib/roles";

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

function isValidUrl(value: string) {
  return !value || /^https?:\/\/.+/i.test(value.trim());
}

export function StaffForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: StaffFormValues;
}) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [socials, setSocials] = useState<Social[]>(initial?.socials ?? []);
  const [dirty, setDirty] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!dirty) return;
    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [dirty]);

  function markDirty() {
    setDirty(true);
    setSocialError("");
  }

  function updateSocial(i: number, key: keyof Social, value: string) {
    setSocials((previous) => previous.map((social, index) => (index === i ? { ...social, [key]: value } : social)));
    markDirty();
  }

  function addSocial() {
    setSocials((previous) => [...previous, { label: "", url: "" }]);
    markDirty();
  }

  function removeSocial(i: number) {
    setSocials((previous) => previous.filter((_, index) => index !== i));
    markDirty();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = socials.findIndex((social) => !isValidUrl(social.url));
    if (invalid >= 0) {
      setSocialError(`Link ${invalid + 1} must start with http:// or https://.`);
      return;
    }

    setDirty(false);
    setSocialError("");
    startTransition(() => {
      void action(new FormData(event.currentTarget));
    });
  }

  const socialHasError = (value: string) => value && !isValidUrl(value);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {dirty && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <IconAlert size={17} className="mt-0.5 shrink-0" />
          <span>You have unsaved changes. Leaving this page may discard them.</span>
        </div>
      )}
      <input type="hidden" name="socials" value={JSON.stringify(socials)} />

      <section className="space-y-5">
        <div>
          <p className="eyebrow">01 · Identity</p>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Who is this team member?</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="staff-name">Name *</label>
            <input id="staff-name" name="name" className="input" required maxLength={100} defaultValue={initial?.name ?? ""} placeholder="Full name" onChange={markDirty} />
            <p className="field-help">Shown publicly in the team directory.</p>
          </div>
          <div>
            <label className="field-label" htmlFor="staff-vrchat">VRChat username *</label>
            <input id="staff-vrchat" name="vrchatUsername" className="input" required maxLength={50} defaultValue={initial?.vrchatUsername ?? ""} placeholder="username" onChange={markDirty} />
            <p className="field-help">Must be unique across the staff directory.</p>
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-ink-100 pt-6 dark:border-ink-800">
        <div>
          <p className="eyebrow">02 · Role</p>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">What do they do?</h2>
        </div>
        <div>
          <label className="field-label" htmlFor="staff-rank">Rank / role</label>
          <input id="staff-rank" name="rank" className="input" maxLength={80} list="staff-rank-options" defaultValue={initial?.rank ?? ""} placeholder="e.g. Admin, Moderator, Event Host" onChange={markDirty} />
          <datalist id="staff-rank-options">
            {STAFF_ROLES.map((role) => <option key={role.key} value={role.label} />)}
          </datalist>
          <p className="field-help">Use a configured role when possible so badges and summaries stay consistent.</p>
        </div>
      </section>

      <section className="space-y-5 border-t border-ink-100 pt-6 dark:border-ink-800">
        <div>
          <p className="eyebrow">03 · Profile</p>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Tell the community about them</h2>
        </div>
        <div>
          <label className="field-label" htmlFor="staff-bio">Short bio</label>
          <textarea id="staff-bio" name="bio" rows={5} className="textarea" maxLength={1000} defaultValue={initial?.bio ?? ""} placeholder="A warm, concise introduction to this person…" onChange={markDirty} />
          <div className="mt-1 flex justify-between gap-4">
            <p className="field-help">Markdown is supported on the profile page.</p>
            <p className="field-help">{(initial?.bio?.length ?? 0)}/1000</p>
          </div>
        </div>
        <ImageUpload label="Staff photo / avatar" value={photoUrl} onChange={(value) => { setPhotoUrl(value); markDirty(); }} folder="staff" name="photoUrl" help="Shown on the staff directory and profile." />
      </section>

      <section className="space-y-5 border-t border-ink-100 pt-6 dark:border-ink-800">
        <div>
          <p className="eyebrow">04 · Social links</p>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Where can people connect?</h2>
        </div>
        {socialError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <IconAlert size={17} className="mt-0.5 shrink-0" />
            <span>{socialError}</span>
          </div>
        )}
        <div className="space-y-3">
          {socials.map((social, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
              <input className="input" maxLength={50} placeholder="Label (e.g. Twitter)" value={social.label} onChange={(event) => updateSocial(i, "label", event.target.value)} aria-label={`Social link ${i + 1} label`} />
              <input className="input" type="url" maxLength={500} placeholder="https://…" value={social.url} onChange={(event) => updateSocial(i, "url", event.target.value)} aria-label={`Social link ${i + 1} URL`} aria-invalid={socialHasError(social.url) || undefined} />
              <button type="button" onClick={() => removeSocial(i)} className="btn-icon hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label={`Remove social link ${i + 1}`}>
                <IconX size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addSocial} className="btn-secondary btn-sm mt-3">
          <IconPlus size={15} /> Add link
        </button>
      </section>

      <section className="space-y-5 border-t border-ink-100 pt-6 dark:border-ink-800">
        <div>
          <p className="eyebrow">05 · Display order</p>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-white">Where should they appear?</h2>
        </div>
        <div className="max-w-xs">
          <label className="field-label" htmlFor="staff-order">Display order</label>
          <input id="staff-order" name="sortOrder" type="number" min={0} step={1} className="input" defaultValue={initial?.sortOrder ?? 0} onChange={markDirty} />
          <p className="field-help">Lower numbers appear first within their rank group.</p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-ink-100 pt-5 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/staff" className="btn-ghost btn-sm self-start sm:self-auto">Cancel</Link>
        <button type="submit" disabled={isPending} className="btn-primary btn-sm">
          {isPending ? "Saving…" : initial?.id ? "Save changes" : "Save staff member"}
        </button>
      </div>
    </form>
  );
}
