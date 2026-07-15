import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { Suspense } from "react";
import { ShopGallery, type ShopDesignPublic } from "./ShopGallery";
import { Skeleton } from "@/components/Skeleton";
import { IconTag, IconClock } from "@/components/admin/ui/icons";

export const revalidate = 300;

export const metadata = {
  title: "Shop",
  description:
    "Coming soon — Ur Gay Now clothing, outfits, and community designs. Browse the upcoming product showcase.",
};

async function ShopContent() {
  const designs = await safeQuery(
    () =>
      prisma.shopDesign.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    [] as ShopDesignPublic[],
  );

  const mapped: ShopDesignPublic[] = designs.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    creator: d.creator,
    category: d.category,
    imageUrl: d.imageUrl,
    imageAlt: d.imageAlt,
    galleryUrls: d.galleryUrls ?? [],
    featured: d.featured,
  }));

  return (
    <>
      <div className="mb-10 rounded-2xl border border-brand-200 bg-brand-50 px-6 py-5 dark:border-brand-900 dark:bg-brand-900/30">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pride-gradient text-white">
            <IconClock size={20} />
          </span>
          <div>
            <p className="text-base font-semibold text-brand-800 dark:text-brand-100">Opening Soon</p>
            <p className="mt-1 text-sm text-brand-700 dark:text-brand-200">
              Our shop is being prepared. We&apos;re lining up Ur Gay Now clothing, outfits, and
              community designs — browse the showcase below and check back when we open.
            </p>
          </div>
        </div>
      </div>

      {mapped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40 dark:text-brand-300">
            <IconTag size={28} />
          </span>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">No designs published yet</h2>
          <p className="mx-auto mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
            We&apos;re still putting the showcase together. New clothing, outfits, and accessories
            will appear here as soon as they&apos;re ready.
          </p>
        </div>
      ) : (
        <ShopGallery designs={mapped} />
      )}
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  return (
    <>
      <PageHeader
        title="Our Shop"
        description="A first look at upcoming Ur Gay Now clothing, outfits, and community designs."
      />
      <Container className="py-12">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopContent />
        </Suspense>
      </Container>
    </>
  );
}
