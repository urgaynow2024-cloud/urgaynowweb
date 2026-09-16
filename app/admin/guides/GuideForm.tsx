"use client";

const CATEGORIES = [
  "GETTING_STARTED",
  "VRCHAT",
  "EVENTS",
  "COMMUNITY",
  "REPORTS",
  "ACCOUNTS",
  "SAFETY",
  "WEBSITE",
  "ACCESSIBILITY",
  "GENERAL",
  "SUPPORT",
  "STAFF",
  "DISCORD_SERVER",
] as const;

export type GuideCategory = (typeof CATEGORIES)[number];

export type GuideFormValues = {
  category: GuideCategory;
  question: string;
  answer: string;
  sortOrder: number;
  slug: string;
  relatedGuides: string;
};

function formatCategory(cat: string): string {
  return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function GuideForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: GuideFormValues;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <select id="category" name="category" className="select" defaultValue={initial?.category ?? "GENERAL"}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="question">Question *</label>
          <input id="question" name="question" className="input" required defaultValue={initial?.question ?? ""} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="slug">URL Slug *</label>
        <input id="slug" name="slug" className="input" required defaultValue={initial?.slug ?? ""} placeholder="getting-started-how-to-join" />
        <p className="field-help">Lowercase, hyphens only. Used in URL: /guides/your-slug</p>
      </div>
      <div>
        <label className="field-label" htmlFor="answer">Answer (Markdown)</label>
        <textarea id="answer" name="answer" rows={8} className="textarea font-mono text-sm" defaultValue={initial?.answer ?? ""} />
      </div>
      <div>
        <label className="field-label" htmlFor="relatedGuides">Related Guide IDs (comma-separated)</label>
        <input id="relatedGuides" name="relatedGuides" className="input" defaultValue={initial?.relatedGuides ?? ""} placeholder="abc123,def456" />
        <p className="field-help">Optional: Link to other guides for &ldquo;Related articles&rdquo; section</p>
      </div>
      <div>
        <label className="field-label" htmlFor="sortOrder">Display order</label>
        <input id="sortOrder" name="sortOrder" type="number" className="input w-32" defaultValue={initial?.sortOrder ?? 0} />
      </div>
      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  );
}