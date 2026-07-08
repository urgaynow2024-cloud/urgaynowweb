import Link from "next/link";
import { createLink } from "../actions";
import { LinkForm } from "../LinkForm";

export default function NewLinkPage() {
  return (
    <div>
      <Link href="/admin/links" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to links
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add link</h1>
      <div className="card">
        <LinkForm action={createLink} />
      </div>
    </div>
  );
}
