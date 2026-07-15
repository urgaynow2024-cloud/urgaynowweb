import { Container, PageHeader } from "@/components/Container";
import { prisma } from "@/lib/db";
import { StaffCard } from "@/components/StaffCard";
import { getSetting } from "@/lib/settings";
import { safeQuery } from "@/lib/safeQuery";

export const revalidate = 300;

export const metadata = {
  title: "Staff",
  description: "Meet the Ur Gay Now team — staff, moderators, and community leads.",
};

export default async function StaffPage() {
  // Wrapped in safeQuery: if the database is unreachable, the page renders the
  // empty-state instead of throwing a server-side exception (the /staff crash).
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
          <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="text-xl text-zinc-500 dark:text-zinc-400">Our team directory is being set up. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {ranks.map((rank) => (
              <section key={rank}>
                <h2 className="mb-6 text-3xl font-bold text-zinc-900 dark:text-white">{rank}</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {discord && (
              <a href={discord} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-3">
                Join our Discord
              </a>
            )}
            {vrchat && (
              <a href={vrchat} target="_blank" rel="noopener noreferrer" className="btn-secondary text-lg px-8 py-3">
                VRChat Group
              </a>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
