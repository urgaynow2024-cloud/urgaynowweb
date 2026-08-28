import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { safeQuery } from "@/lib/safeQuery";
import { Suspense } from "react";
import { ShopGallery, type ShopDesignPublic } from "./ShopGallery";
import { Skeleton } from "@/components/Skeleton";
import { IconTag, IconClock } from "@/components/admin/ui/icons";
import { ScrollFadeIn } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

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
      <div className="card overflow-hidden border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-900/30">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pride-gradient text-white shadow-glow">
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
        <EmptyState
          icon={
            <IconTag size={32} />
          }
          title="No designs published yet"
          description="We're still putting the showcase together. New clothing, outfits, and accessories will appear here as soon as they're ready."
          className="mt-10"
        />
      ) : (
        <div className="mt-10">
          <ScrollFadeIn>
            <ShopGallery designs={mapped} />
          </ScrollFadeIn>
        </div>
      )}
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900"
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
      <Container className="py-16">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopContent />
        </Suspense>
      </Container>
    </>
  );
}
