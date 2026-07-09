import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { parseSocials } from "@/lib/utils";
import { PartnerCard } from "@/components/PartnerCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partners & Affiliates",
  description: "Communities, groups, and creators connected with Ur Gay Now.",
};

const TAG_ORDER = ["Partner", "Affiliate", "Friend Community"];

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

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
      <Container className="py-12">
        {partners.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
            No partners yet — check back soon!
          </p>
        ) : (
          <div className="space-y-12">
            {tags.map((tag) => {
              const group = partners.filter((p) => p.tag === tag);
              if (group.length === 0) return null;
              return (
                <section key={tag}>
                  <h2 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-white">{tag}s</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((p) => (
                      <PartnerCard
                        key={p.id}
                        partner={{
                          id: p.id,
                          name: p.name,
                          logoUrl: p.logoUrl,
                          description: p.description,
                          links: parseSocials(p.links),
                          tag: p.tag,
                        }}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
