import Link from "next/link";
import { createRule } from "../actions";
import { RuleForm } from "../RuleForm";

export default function NewRulePage() {
  return (
    <div>
      <Link href="/admin/rules" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to rules
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add rule</h1>
      <div className="card">
        <RuleForm action={createRule} />
      </div>
    </div>
  );
}
