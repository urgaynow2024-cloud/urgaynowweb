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
          <label className="label" htmlFor="category">Category</label>
          <input id="category" name="category" className="input" defaultValue={initial?.category ?? "General"} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" name="title" className="input" required defaultValue={initial?.title ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="content">Details (Markdown)</label>
        <textarea id="content" name="content" rows={5} className="input font-mono text-sm" defaultValue={initial?.content ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="sortOrder">Display order</label>
        <input id="sortOrder" name="sortOrder" type="number" className="input w-32" defaultValue={initial?.sortOrder ?? 0} />
      </div>
      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}
