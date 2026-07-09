import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { AnnouncementCard } from "@/components/AnnouncementCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News & Announcements",
  description: "The latest news, announcements, and updates from Ur Gay Now.",
};

export default async function NewsPage() {
  const items = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <PageHeader title="News & Announcements" description="The latest updates from the community." />
      <Container className="py-12">
        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <AnnouncementCard
                key={a.id}
                item={{
                  id: a.id,
                  title: a.title,
                  slug: a.slug,
                  excerpt: a.excerpt,
                  coverImage: a.coverImage,
                  publishedAt: a.publishedAt,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            No announcements yet.{" "}
            <Link href="/" className="text-brand-600 hover:underline">Back to home</Link>
          </p>
        )}
      </Container>
    </>
  );
}
