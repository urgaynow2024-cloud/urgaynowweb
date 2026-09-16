import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getSetting } from "@/lib/settings";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { ScrollFadeIn } from "@/components/ScrollAnimation";
import { GalleryToolbar } from "@/components/gallery/GalleryToolbar";

export const revalidate = 60;

const PER_PAGE = 12;

const TYPE_LABELS: Record<string, string> = {
  ARTWORK: "Artwork",
  AVATAR: "Avatars",
  SCREENSHOT: "Screenshots",
  PHOTOGRAPHY: "Photography",
  VRCHAT_WORLD: "VRChat Worlds",
  CREATOR_PROJECT: "Creator Projects",
  OTHER: "Other",
};

export const metadata = {
  title: "Gallery",
  description: "Photos and moments from the Ur Gay Now community.",
};

type GalleryItem = {
  id: string;
  sourceType: "SUBMISSION" | "GALLERY_IMAGE" | "GROUP_PHOTO";
  sourceId: string;
  title: string;
  description: string;
  imageUrl: string;
  submitterName: string;
  category: string;
  createdAt: string;
  href: string;
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; type?: string; sort?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() || "";
  const type = searchParams.type?.trim() || "";
  const sort = searchParams.sort === "old" ? "old" : "new";

  const [submissions, images, groupPhotos] = await Promise.all([
    prisma.communitySubmission.findMany({
      where: { status: "APPROVED", published: true },
      orderBy: { createdAt: sort === "old" ? "asc" : "desc" },
    }),
    prisma.galleryImage.findMany({
      where: { status: "APPROVED", published: true },
      orderBy: { createdAt: sort === "old" ? "asc" : "desc" },
    }),
    prisma.groupPhoto.findMany({
      orderBy: { createdAt: sort === "old" ? "asc" : "desc" },
    }),
  ]);

  const all: GalleryItem[] = [
    ...submissions.map((s) => ({
      id: s.id,
      sourceType: "SUBMISSION" as const,
      sourceId: s.id,
      title: s.title,
      description: s.description,
      imageUrl: s.imageUrl,
      submitterName: s.submitterName,
      category: TYPE_LABELS[s.type] ?? s.type,
      createdAt: s.createdAt.toISOString(),
      href: `/community/${s.id}`,
    })),
    ...images.map((g) => ({
      id: g.id,
      sourceType: "GALLERY_IMAGE" as const,
      sourceId: g.id,
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      submitterName: g.submitterName,
      category: "Photo",
      createdAt: g.createdAt.toISOString(),
      href: `/gallery/${g.id}`,
    })),
    ...groupPhotos.map((g) => ({
      id: g.id,
      sourceType: "GROUP_PHOTO" as const,
      sourceId: g.id,
      title: g.title,
      description: g.description,
      imageUrl: g.imageUrl,
      submitterName: "",
      category: "Group moment",
      createdAt: g.createdAt.toISOString(),
      href: `/groups/${g.id}`,
    })),
  ];

  const filtered = all.filter((item) => {
    if (q) {
      const hay = `${item.title} ${item.description} ${item.submitterName}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    if (type && item.category !== type) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const availableTypes = Array.from(
    new Set(all.map((i) => i.category).filter(Boolean))
  ).sort();

  const discord = await getSetting("discordInvite");

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Approved community moments — artwork, photos, screenshots, and group hangs."
      />
      <Container className="py-16">
        <div className="mb-8 space-y-4">
          <Card hover className="group flex items-center justify-between gap-4 border-brand-200 bg-brand-50 p-6 transition-colors hover:border-brand-300 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100 dark:hover:border-brand-700">
            <span>
              <span className="font-semibold text-brand-800 dark:text-brand-100">Share your moment</span> — submit it and our team will review it.
            </span>
            <Link href="/community/submit" className="btn-primary btn-sm shrink-0">
              Share a photo
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

        <GalleryToolbar
          q={q}
          type={type}
          sort={sort}
          types={availableTypes}
          resultCount={filtered.length}
          basePath="/gallery"
        />

        <ScrollFadeIn>
          <GalleryGrid images={paged} emptyState={{ q, type, total: filtered.length }} />
        </ScrollFadeIn>

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination page={page} totalPages={totalPages} basePath="/gallery" />
          </div>
        )}
      </Container>
    </>
  );
}