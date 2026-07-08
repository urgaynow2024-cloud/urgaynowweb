import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateLink } from "../actions";
import { LinkForm, type LinkFormValues } from "../LinkForm";

export default async function EditLinkPage({ params }: { params: { id: string } }) {
  const l = await prisma.link.findUnique({ where: { id: params.id } });
  if (!l) notFound();

  const initial: LinkFormValues = {
    label: l.label,
    url: l.url,
    icon: l.icon,
    sortOrder: l.sortOrder,
  };

  return (
    <div>
      <Link href="/admin/links" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to links
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit link</h1>
      <div className="card">
        <LinkForm action={updateLink.bind(null, l.id)} initial={initial} />
      </div>
    </div>
  );
}
