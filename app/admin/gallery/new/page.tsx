import Link from "next/link";
import { createGalleryImage } from "../actions";
import { ImageItemForm } from "@/components/admin/ImageItemForm";

export default function NewGalleryImagePage() {
  return (
    <div>
      <Link href="/admin/gallery" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to gallery
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add gallery image</h1>
      <div className="card">
        <ImageItemForm action={createGalleryImage} folder="gallery" titleLabel="Image title" />
      </div>
    </div>
  );
}
