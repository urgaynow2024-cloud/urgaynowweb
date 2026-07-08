import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateRule } from "../actions";
import { RuleForm, type RuleFormValues } from "../RuleForm";

export default async function EditRulePage({ params }: { params: { id: string } }) {
  const r = await prisma.rule.findUnique({ where: { id: params.id } });
  if (!r) notFound();

  const initial: RuleFormValues = {
    category: r.category,
    title: r.title,
    content: r.content,
    sortOrder: r.sortOrder,
  };

  return (
    <div>
      <Link href="/admin/rules" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to rules
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit rule</h1>
      <div className="card">
        <RuleForm action={updateRule.bind(null, r.id)} initial={initial} />
      </div>
    </div>
  );
}
