"use client";

export type LinkFormValues = {
  label: string;
  url: string;
  icon: string;
  sortOrder: number;
};

export function LinkForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: LinkFormValues;
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="label">Label *</label>
          <input id="label" name="label" className="input" required defaultValue={initial?.label ?? ""} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="url">URL *</label>
          <input id="url" name="url" className="input" required type="url" placeholder="https://…" defaultValue={initial?.url ?? ""} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="icon">Icon (emoji or text)</label>
          <input id="icon" name="icon" className="input" placeholder="💜" defaultValue={initial?.icon ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="sortOrder">Display order</label>
          <input id="sortOrder" name="sortOrder" type="number" className="input w-32" defaultValue={initial?.sortOrder ?? 0} />
        </div>
      </div>
      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}
