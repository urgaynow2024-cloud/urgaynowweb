import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { PageHeader, Container, Section } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyState } from "@/components/EmptyState";
import { StaggeredList, ScrollFadeIn } from "@/components/ScrollAnimation";
import { LinkCard, LinkGlyph } from "@/components/LinkCard";
import { LINK_CATEGORIES, parseDomain } from "@/lib/links";

export const revalidate = 3600;

export const metadata = {
  title: "Links",
  description: "All the important Ur Gay Now destinations — Discord, VRChat, socials, and support resources.",
};

type FeaturedCard = {
  icon: string;
  label: string;
  description: string;
  badge: { label: string; tone: "brand" | "neutral" | "success" | "warning" | "danger" };
  href: string;
};

const FEATURED_SETTINGS: { key: string; card: Omit<FeaturedCard, "href"> }[] = [
  {
    key: "discordInvite",
    card: {
      icon: "discord",
      label: "Discord Server",
      description: "Join the community for real-time chat, event calls, and announcements.",
      badge: { label: "Official", tone: "danger" },
    },
  },
  {
    key: "vrchatGroupUrl",
    card: {
      icon: "vrchat",
      label: "VRChat Group",
      description: "Enter our VRChat group to attend events and hang out with the community.",
      badge: { label: "VRChat", tone: "success" },
    },
  },
];

export default async function LinksPage() {
  const [dbLinks, settingValues] = await Promise.all([
    safeQuery(
      () =>
        prisma.link.findMany({
          where: { active: true },
          orderBy: { sortOrder: "asc" },
        }),
      [] as Awaited<ReturnType<typeof prisma.link.findMany>>,
    ),
    Promise.all(FEATURED_SETTINGS.map((s) => getSetting(s.key))),
  ]);

  const featuredSettings: FeaturedCard[] = [];
  FEATURED_SETTINGS.forEach((s, i) => {
    if (settingValues[i]) {
      featuredSettings.push({ ...s.card, href: settingValues[i] });
    }
  });

  const dbFeatured = dbLinks.filter((l) => l.featured);
  const dbRest = dbLinks.filter((l) => !l.featured);
  const hasFeatured = featuredSettings.length > 0 || dbFeatured.length > 0;

  const byCategory: Record<string, typeof dbLinks> = {};
  for (const link of dbRest) {
    (byCategory[link.category] ||= []).push(link);
  }

  return (
    <>
      <PageHeader
        title="Links"
        description="Everything you need to connect — Discord, VRChat, socials, support, and our favorite community spots."
      />

      <Container className="py-12">
        {hasFeatured && (
          <Section
            eyebrow="Featured destinations"
            title="Start here"
            subtitle="Quick access to the community's most important homes."
          >
            <StaggeredList className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {featuredSettings.map((f, i) => (
                <ScrollFadeIn key={f.href} delay={i * 80}>
                  <LinkCard
                    href={f.href}
                    title={f.label}
                    icon={f.icon}
                    description={f.description}
                    badge={f.badge}
                    featured
                  />
                </ScrollFadeIn>
              ))}
              {dbFeatured.map((l, i) => (
                <ScrollFadeIn key={l.id} delay={(featuredSettings.length + i) * 80}>
                  <LinkCard
                    href={l.url}
                    title={l.label}
                    icon={l.icon}
                    description={l.description || undefined}
                    domain={parseDomain(l.url) || undefined}
                    featured
                  />
                </ScrollFadeIn>
              ))}
            </StaggeredList>
          </Section>
        )}

        {!hasFeatured && dbLinks.length === 0 && (
          <div className="py-8">
            <EmptyState
              icon={<LinkGlyph icon="link" size={28} />}
              title="No links yet"
              description="The community links hub is being built. Check back soon for our Discord, VRChat, socials, and more."
            />
          </div>
        )}

        {dbRest.length > 0 && (
          <Section className={hasFeatured ? "mt-4 sm:mt-6" : "mt-2 sm:mt-4"}>
            <SectionHeading>All links</SectionHeading>

            {LINK_CATEGORIES.map((cat) => {
              const items = byCategory[cat.key];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat.key} className="mt-8 first:mt-0">
                  <h2 className="mb-4 text-xl font-bold text-ink-900 dark:text-white">
                    {cat.label}
                  </h2>
                  <StaggeredList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((l, i) => (
                      <ScrollFadeIn key={l.id} delay={i * 60}>
                        <LinkCard
                          href={l.url}
                          title={l.label}
                          icon={l.icon}
                          description={l.description || undefined}
                          domain={parseDomain(l.url) || undefined}
                        />
                      </ScrollFadeIn>
                    ))}
                  </StaggeredList>
                </div>
              );
            })}
          </Section>
        )}
      </Container>
    </>
  );
}
