"use client";

import { useState } from "react";
import { LINK_CATEGORIES } from "@/lib/links";
import { LinkCard } from "@/components/LinkCard";
import { IconEyeOff, IconStar } from "@/components/admin/ui/icons";

export type LinkFormValues = {
  label: string;
  url: string;
  icon: string;
  description: string;
  category: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export function LinkForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Partial<LinkFormValues>;
}) {
  const [values, setValues] = useState<LinkFormValues>({
    label: initial?.label ?? "",
    url: initial?.url ?? "",
    icon: initial?.icon ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "Other",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder ?? 0,
  });

  const update = (field: keyof LinkFormValues, value: any) =>
    setValues((v) => ({ ...v, [field]: value }));

  return (
    <form action={action} className="space-y-7">
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="label">
            Label *
          </label>
          <input
            id="label"
            name="label"
            className="input"
            required
            value={values.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="e.g. Community Discord"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="url">
            Destination URL *
          </label>
          <input
            id="url"
            name="url"
            type="url"
            className="input"
            required
            value={values.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://discord.gg/your-invite"
          />
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Must be a valid http:// or https:// URL. The link opens in a new
            tab with <code rel="noopener noreferrer">noopener noreferrer</code> for safety.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {LINK_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="sortOrder">
            Display order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            className="input w-32"
            value={values.sortOrder}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Lower numbers appear first within a category.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="icon">
            Icon
          </label>
          <input
            id="icon"
            name="icon"
            className="input"
            value={values.icon}
            onChange={(e) => update("icon", e.target.value)}
            placeholder='discord, vrchat, or an emoji →'
          />
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            Use <code>discord</code> or <code>vrchat</code> for branded glyphs, or a short
            emoji/text label.
          </p>
        </div>

        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              className="h-4 w-4 rounded border-ink-300"
              checked={values.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Featured destination
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              className="h-4 w-4 rounded border-ink-300"
              checked={values.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="input"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Short description shown on the links hub."
          />
        </div>
      </fieldset>

      <div className="border-t border-ink-200 pt-5 dark:border-ink-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          Live preview
        </p>
        <div className="mt-4 max-w-sm">
          <LinkCard
            preview
            href={values.url || "#"}
            title={values.label || "Untitled link"}
            icon={values.icon}
            description={values.description || undefined}
            domain={
              values.url
                ? (() => {
                    try {
                      return new URL(
                        /^https?:\/\//i.test(values.url)
                          ? values.url
                          : `https://${values.url}`,
                      ).hostname.replace(/^www\./, "");
                    } catch {
                      return undefined;
                    }
                  })()
                : undefined
            }
            featured={values.featured}
            badge={
              values.featured
                ? { label: "Featured", tone: "brand" }
                : { label: values.category, tone: "neutral" }
            }
          />
          {!values.active && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <IconEyeOff size={14} /> This link is inactive and will not appear publicly.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
          <IconStar size={13} />
          Featured links render larger in the hub and get a star badge.
        </span>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
