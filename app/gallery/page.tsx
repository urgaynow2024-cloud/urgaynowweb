import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Badge, Card } from "@/components/ui";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getSetting } from "@/lib/settings";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { ScrollFadeIn } from "@/components/ScrollAnimation";

export const revalidate = 60;

const PER_PAGE = 12;

export const metadata = {
  title: "Gallery",
  description: "Photos and moments from the Ur Gay Now community.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [images, groupPhotos, pendingCount] = await Promise.all([
    prisma.galleryImage.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.galleryImage.count({ where: { status: "PENDING" } }),
  ]);
  const discord = await getSetting("discordInvite");

  const all = [
    ...groupPhotos.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      isGroup: true,
      groupId: g.id,
    })),
    ...images.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      isGroup: false,
    })),
  ];

  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const paged = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <PageHeader title="Gallery" description="Snapshots of our favourite community moments." />
      <Container className="py-16">
        <div className="mb-8 space-y-4">
          <Card hover className="group flex items-center justify-between gap-4 border-brand-200 bg-brand-50 p-6 transition-colors hover:border-brand-300 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100 dark:hover:border-brand-700">
            <span>
              <span className="font-semibold text-brand-800 dark:text-brand-100">Share your photo</span> — submit it to the gallery and our team will review it.
            </span>
            <Link href="/gallery/submit" className="btn-primary btn-sm shrink-0">
              Submit a photo
            </Link>
          </Card>
          {discord && (
            <Card className="p-6 text-base text-ink-700 dark:text-ink-200">
              Chat with the community in our{" "}
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 underline dark:text-brand-300"
              >
                Discord
              </a>
              !
            </Card>
          )}
        </div>
        {pendingCount > 0 && (
          <Badge tone="warning" dot>
            {pendingCount} photo{pendingCount === 1 ? "" : "s"} awaiting moderator review
          </Badge>
        )}

        <ScrollFadeIn>
          <GalleryGrid images={paged} />
        </ScrollFadeIn>

        <div className="mt-12">
          <Pagination page={page} totalPages={totalPages} basePath="/gallery" />
        </div>
      </Container>
    </>
  );
}
