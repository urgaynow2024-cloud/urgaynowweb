import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ScrollFadeIn } from "@/components/ScrollAnimation";
import { ReportButton } from "@/components/report/ReportModal";

export const revalidate = 300;

export default async function GroupPhotoPage({ params }: { params: { id: string } }) {
  const group = await prisma.groupPhoto.findUnique({ where: { id: params.id } });
  if (!group) notFound();

  const bannerUrl = (group as any).bannerUrl || "";

  return (
    <>
      <PageHeader title={group.title} description={group.description} />

      {/* Banner */}
      {bannerUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-ink-100 dark:bg-ink-800 sm:h-64">
          <Image
            src={bannerUrl}
            alt={`${group.title} banner`}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
        </div>
      )}

      <Container className="py-12 sm:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">{group.title}</h2>
          <ReportButton contentType="GROUP_PHOTO" contentId={group.id} contentTitle={group.title} size="sm" variant="outline" className="rounded-full border-ink-300 text-ink-700 hover:bg-ink-100 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-800" />
        </div>
        {group.description && (
          <p className="mb-6 text-sm text-ink-500 dark:text-ink-400 max-w-2xl">
            {group.description}
          </p>
        )}
        <div className="mx-auto max-w-3xl">
          <ScrollFadeIn>
            <div className="card overflow-hidden p-4 sm:p-6">
              <div className="relative w-full overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                <Image
                  src={group.imageUrl}
                  alt={group.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                />
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold text-ink-900 dark:text-white">{group.title}</h2>
                {group.description && (
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </Container>
    </>
  );
}
