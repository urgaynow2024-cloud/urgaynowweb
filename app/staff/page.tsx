import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";

export const revalidate = 300;

export const metadata = {
  title: "Staff",
  description: "Meet the Ur Gay Now team — staff, moderators, and community leads.",
};

export default async function StaffPage() {
  const [staff, discord, vrchat] = await Promise.all([
    prisma.staff.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
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
      <Container className="py-12">
        {staff.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            Our team directory is being set up. Check back soon!
          </p>
        ) : (
          <div className="space-y-12">
            {ranks.map((rank) => (
              <section key={rank}>
                <h2 className="mb-5 text-2xl font-bold text-zinc-900 dark:text-white">{rank}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {staff
                    .filter((s) => s.rank === rank)
                    .map((s) => (
                      <StaffCard
                        key={s.id}
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
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
        {(discord || vrchat) && (
          <div className="mt-12 flex flex-wrap gap-3">
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Join our Discord
              </a>
            )}
            {vrchat && (
              <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                VRChat Group
              </a>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
