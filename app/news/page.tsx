import Link from "next/link";
import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { Pagination } from "@/components/Pagination";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 60;

const PAGE_SIZE = 9;

export const metadata = {
  title: "News & Announcements",
  description: "The latest news, announcements, and updates from Ur Gay Now.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.announcement.count({ where: { published: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <>
      <PageHeader title="News & Announcements" description="The latest updates from the community." />
      <Container className="py-16">
        {items.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No announcements yet"
            description="Check back soon for community news and updates!"
          />
        ) : (
          <div className="space-y-16">
            {/* Featured article */}
            {featured && (
              <section>
                <ScrollFadeIn>
                  <AnnouncementCard
                    item={{
                      id: featured.id,
                      title: featured.title,
                      slug: featured.slug,
                      excerpt: featured.excerpt,
                      coverImage: featured.coverImage,
                      publishedAt: featured.publishedAt,
                    }}
                    featured
                  />
                </ScrollFadeIn>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((a, i) => (
                    <ScrollFadeIn key={a.id} delay={i * 80}>
                      <AnnouncementCard
                        item={{
                          id: a.id,
                          title: a.title,
                          slug: a.slug,
                          excerpt: a.excerpt,
                          coverImage: a.coverImage,
                          publishedAt: a.publishedAt,
                        }}
                      />
                    </ScrollFadeIn>
                  ))}
                </StaggeredList>
              </section>
            )}

            <div className="mt-12">
              <Pagination page={page} totalPages={totalPages} basePath="/news" />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
