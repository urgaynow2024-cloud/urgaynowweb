import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { parseSocials } from "@/lib/utils";
import { PartnerCard } from "@/components/PartnerCard";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { Alert } from "@/components/ui";
import { Card } from "@/components/ui";

export const revalidate = 3600;

export const metadata = {
  title: "Partners & Affiliates",
  description: "Communities, groups, and creators connected with Ur Gay Now.",
};

const TAG_ORDER = ["Partner", "Affiliate", "Friend Community"];

export default async function PartnersPage() {
  const partners = await safeQuery(
    () =>
      prisma.partner.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [] as Awaited<ReturnType<typeof prisma.partner.findMany>>,
  );

  const tags = Array.from(new Set(partners.map((p) => p.tag).filter(Boolean)));
  tags.sort((a, b) => {
    const ia = TAG_ORDER.indexOf(a);
    const ib = TAG_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <>
      <PageHeader
        title="Partners & Affiliates"
        description="The communities, groups, and creators we're proud to be connected with."
      />
      <Container className="py-16">
        {partners.length === 0 ? (
          <EmptyState
            icon="ðŸ¤"
            title="No partners yet"
            description="Check back soon for our growing list of community friends!"
            action={
              <Link href="/partnership/apply" className="btn-primary">
                Apply to become a partner
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-16">
              {tags.map((tag) => (
                <section key={tag}>
                  <SectionHeading>{tag}</SectionHeading>
                  <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {partners
                      .filter((p) => p.tag === tag)
                      .map((p, i) => (
                        <ScrollFadeIn key={p.id} delay={i * 60}>
                          <PartnerCard
                            partner={{
                              id: p.id,
                              name: p.name,
                              logoUrl: p.logoUrl ?? "",
                              description: p.description ?? "",
                              links: parseSocials(p.links),
                              tag: p.tag ?? "",
                            }}
                          />
                        </ScrollFadeIn>
                      ))}
                  </StaggeredList>
                </section>
              ))}
            </div>

            <Card className="mt-12 p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white mb-4">
                Interested in partnering with us?
              </h2>
              <p className="text-sm text-ink-600 dark:text-ink-400 mb-6">
                Weâ€™re always looking for communities, creators, and groups to partner with.
                Submit an application and our staff team will review it.
              </p>
              <Link href="/partnership/apply" className="btn-primary">
                Apply for a partnership
              </Link>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
