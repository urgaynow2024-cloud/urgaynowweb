import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGroupPhoto } from "../actions";
import { GroupPhotoForm, type GroupPhotoFormValues } from "@/components/admin/GroupPhotoForm";

export default async function EditGroupPhotoPage({ params }: { params: { id: string } }) {
  const g = await prisma.groupPhoto.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: GroupPhotoFormValues = {
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    bannerUrl: g.bannerUrl || "",
    rules: g.rules || "",
  };

  return (
    <div>
      <Link href="/admin/group-photos" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to group photos
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit group photo</h1>
      <div className="card">
        <GroupPhotoForm
          action={updateGroupPhoto.bind(null, g.id)}
          initial={initial}
          folder="group-photos"
        />
      </div>
    </div>
  );
}
