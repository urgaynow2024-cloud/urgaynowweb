import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { CopyRulesButton } from "./CopyRulesButton";

export const dynamic = "force-dynamic";

export default async function GroupPhotoPage({ params }: { params: { id: string } }) {
  const group = await prisma.groupPhoto.findUnique({ where: { id: params.id } });
  if (!group) notFound();

  const bannerUrl = (group as any).bannerUrl || "";
  const rules = (group as any).rules || "";

  return (
    <>
      <PageHeader title={group.title} description={group.description} />
      
      {/* Banner */}
      {bannerUrl && (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt={`${group.title} banner`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Avatar and info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={group.imageUrl}
                  alt={group.title}
                  className="h-full w-full object-cover"
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

          {/* Right column - Rules */}
          <div className="lg:col-span-2">
            {rules ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Group Rules</h3>
                  <CopyRulesButton rules={rules} />
                </div>
                <div className="prose-zinc max-w-none">
                  <Markdown content={rules} />
                </div>
              </div>
            ) : (
              <div className="card">
                <p className="text-zinc-500 dark:text-zinc-400">No rules set for this group.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
