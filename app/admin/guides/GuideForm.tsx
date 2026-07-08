"use client";

export type GuideFormValues = {
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
};

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
          <label className="label" htmlFor="category">Category</label>
          <input id="category" name="category" className="input" defaultValue={initial?.category ?? "General"} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="question">Question *</label>
          <input id="question" name="question" className="input" required defaultValue={initial?.question ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="answer">Answer (Markdown)</label>
        <textarea id="answer" name="answer" rows={6} className="input font-mono text-sm" defaultValue={initial?.answer ?? ""} />
      </div>
      <div>
        <label className="label" htmlFor="sortOrder">Display order</label>
        <input id="sortOrder" name="sortOrder" type="number" className="input w-32" defaultValue={initial?.sortOrder ?? 0} />
      </div>
      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}
