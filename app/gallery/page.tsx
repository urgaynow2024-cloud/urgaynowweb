import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getSetting } from "@/lib/settings";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
  const [images, groupPhotos] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.groupPhoto.findMany({ orderBy: { createdAt: "desc" } }),
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
        {discord && (
          <div className="mb-8 rounded-2xl border-2 border-brand-200 bg-brand-50 px-6 py-4 text-base text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
            Want to see your photo here? Share it in our{" "}
            <a href={discord} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Discord
            </a>{" "}
            !
          </div>
        )}
        <GalleryGrid images={paged} />
        <Pagination page={page} totalPages={totalPages} basePath="/gallery" />
      </Container>
    </>
  );
}
