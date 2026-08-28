import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollFadeIn, StaggeredList } from "@/components/ScrollAnimation";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata = {
  title: "Staff",
  description: "Meet the Ur Gay Now team — staff, moderators, and community leads.",
};

export default async function StaffPage() {
  const staff = await safeQuery(
    () =>
      prisma.staff.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [] as Awaited<ReturnType<typeof prisma.staff.findMany>>,
  );
  const [discord, vrchat] = await Promise.all([
    getSetting("discordInvite"),
    getSetting("vrchatGroupUrl"),
  ]);

  const ranks = Array.from(new Set(staff.map((s) => s.rank)));

  return (
    <>
      <PageHeader
        title="Staff & Team"
        description="The wonderful people who help keep Ur Gay Now a safe, fun, and welcoming place."
      />
      <Container className="py-16">
        {staff.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Team directory coming soon"
            description="Our staff profiles are being set up. Check back soon to meet the team!"
          />
        ) : (
          <div className="space-y-16">
            {ranks.map((rank) => (
              <section key={rank}>
                <SectionHeading>{rank}</SectionHeading>
                <StaggeredList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {staff
                    .filter((s) => s.rank === rank)
                    .map((s, i) => (
                      <ScrollFadeIn key={s.id} delay={i * 60}>
                        <StaffCard
                          staff={{
                            id: s.id,
                            name: s.name,
                            vrchatUsername: s.vrchatUsername,
                            rank: s.rank,
                            bio: s.bio,
                            photoUrl: s.photoUrl,
                            socials: s.socials,
                          }}
                        />
                      </ScrollFadeIn>
                    ))}
                </StaggeredList>
              </section>
            ))}
          </div>
        )}
        {(discord || vrchat) && (
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {discord && (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Join our Discord
                </span>
              </a>
            )}
            {vrchat && (
              <a
                href={vrchat}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-lg"
              >
                VRChat Group
              </a>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
