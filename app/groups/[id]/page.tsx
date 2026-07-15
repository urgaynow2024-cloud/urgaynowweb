import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";

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
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={bannerUrl}
            alt={`${group.title} banner`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <Container className="py-12">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="relative w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={group.imageUrl}
                alt={group.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{group.title}</h2>
              {group.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
