import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { parseSocials } from "@/lib/utils";
import { PartnerCard } from "@/components/PartnerCard";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

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
            icon="🤝"
            title="No partners yet"
            description="Check back soon for our growing list of community friends!"
          />
        ) : (
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
        )}
      </Container>
    </>
  );
}
