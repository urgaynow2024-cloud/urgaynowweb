import Link from "next/link";
import { createGuide } from "../actions";
import { GuideForm } from "../GuideForm";

export default function NewGuidePage() {
  return (
    <div>
      <Link href="/admin/guides" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to guides
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add guide / FAQ</h1>
      <div className="card">
        <GuideForm action={createGuide} />
      </div>
    </div>
  );
}
