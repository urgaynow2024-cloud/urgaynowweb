import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } });
  if (!item) return { title: "Announcement not found" };
  return { title: item.title, description: item.excerpt };
}

export default async function AnnouncementPage({ params }: { params: { slug: string } }) {
  const item = await prisma.announcement.findUnique({ where: { slug: params.slug } });
  if (!item || !item.published) notFound();

  return (
    <article>
      {item.coverImage && (
        <div className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 sm:h-72">
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}
      <Container className="max-w-3xl py-12">
        <Link href="/news" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
          ← Back to news
        </Link>
        <time className="mt-6 block text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {formatDate(item.publishedAt)}
        </time>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {item.title}
        </h1>
        <div className="mt-8">
          <Markdown content={item.content} />
        </div>
      </Container>
    </article>
  );
}
