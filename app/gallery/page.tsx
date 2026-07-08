import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getSetting } from "@/lib/settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery",
  description: "Photos and moments from the Ur Gay Now community.",
};

export default async function GalleryPage() {
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
      groupId: g.id
    })),
    ...images.map((g) => ({ 
      id: g.id, 
      title: g.title, 
      description: g.description, 
      imageUrl: g.imageUrl,
      isGroup: false
    })),
  ];

  return (
    <>
      <PageHeader title="Gallery" description="Snapshots of our favourite community moments." />
      <Container className="py-12">
        {discord && (
          <p className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
            Want to see your photo here? Share it in our{" "}
            <a href={discord} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Discord
            </a>
            !
          </p>
        )}
        <GalleryGrid images={all} />
      </Container>
    </>
  );
}
