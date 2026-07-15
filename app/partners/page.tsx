import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { parseSocials } from "@/lib/utils";
import { PartnerCard } from "@/components/PartnerCard";
import { safeQuery } from "@/lib/safeQuery";

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
      <Container className="py-12">
        {partners.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
            No partners yet — check back soon!
          </p>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">No partners yet — check back soon!</p>
          </div>
        )}
      </Container>
    </>
  );
}
