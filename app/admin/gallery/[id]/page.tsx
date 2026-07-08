import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGalleryImage } from "../actions";
import { ImageItemForm, type ImageItemFormValues } from "@/components/admin/ImageItemForm";

export default async function EditGalleryImagePage({ params }: { params: { id: string } }) {
  const g = await prisma.galleryImage.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: ImageItemFormValues = {
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
  };

  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to gallery
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit gallery image</h1>
      <div className="card">
        <ImageItemForm
          action={updateGalleryImage.bind(null, g.id)}
          initial={initial}
          folder="gallery"
          titleLabel="Image title"
        />
      </div>
    </div>
  );
}
