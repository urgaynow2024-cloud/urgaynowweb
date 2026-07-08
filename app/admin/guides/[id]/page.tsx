import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGuide } from "../actions";
import { GuideForm, type GuideFormValues } from "../GuideForm";

export default async function EditGuidePage({ params }: { params: { id: string } }) {
  const g = await prisma.guide.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: GuideFormValues = {
    category: g.category,
    question: g.question,
    answer: g.answer,
    sortOrder: g.sortOrder,
  };

  return (
    <div>
      <Link href="/admin/guides" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to guides
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit guide</h1>
      <div className="card">
        <GuideForm action={updateGuide.bind(null, g.id)} initial={initial} />
      </div>
    </div>
  );
}
