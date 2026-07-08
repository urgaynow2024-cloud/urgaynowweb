import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateAnnouncement } from "../actions";
import { AnnouncementForm, type AnnouncementFormValues } from "../AnnouncementForm";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const a = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!a) notFound();

  const initial: AnnouncementFormValues = {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    published: a.published,
    publishedAt: a.publishedAt.toISOString(),
  };

  return (
    <div>
      <Link href="/admin/announcements" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to announcements
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit announcement</h1>
      <div className="card">
        <AnnouncementForm action={updateAnnouncement.bind(null, a.id)} initial={initial} />
      </div>
    </div>
  );
}
