"use client";

export type RuleFormValues = {
  category: string;
  title: string;
  content: string;
  sortOrder: number;
};

export function RuleForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: RuleFormValues;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <input id="category" name="category" className="input" defaultValue={initial?.category ?? "General"} placeholder="General" />
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="title">Title *</label>
          <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} placeholder="Rule title" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="content">Details (Markdown) *</label>
        <textarea id="content" name="content" rows={8} className="textarea font-mono text-sm" defaultValue={initial?.content ?? ""} placeholder="Rule details in **Markdown**…" />
      </div>
      <div>
        <label className="field-label" htmlFor="sortOrder">Display order</label>
        <input id="sortOrder" name="sortOrder" type="number" className="input w-32" defaultValue={initial?.sortOrder ?? 0} />
      </div>
      <div className="flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
        <button type="submit" className="btn-primary">Save rule</button>
      </div>
    </form>
  );
}
