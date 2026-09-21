import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container, PageHeader } from "@/components/Container";
import { RoleBadge } from "@/components/RoleBadge";
import { normalizeRoleKey } from "@/lib/roles";
import { StaffSocialLinks } from "@/components/StaffCard";
import { Markdown } from "@/components/Markdown";
import { formatDate } from "@/lib/utils";
import { ReportButton } from "@/components/report/ReportModal";

type StaffProfilePageProps = {
  params: Promise<{ id: string }>;
};

async function getStaff(id: string) {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      hostedEvents: {
        where: { published: true },
        orderBy: { startDateTime: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
          startDateTime: true,
          endDateTime: true,
          timezone: true,
          location: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: StaffProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const staff = await getStaff(id);
  if (!staff) return { title: "Staff member not found" };

  return {
    title: `${staff.name} | Staff`,
    description: staff.bio || `Meet ${staff.name}, ${staff.rank} at Ur Gay Now.`,
  };
}

export default async function StaffProfilePage({ params }: StaffProfilePageProps) {
  const { id } = await params;
  const staff = await getStaff(id);
  if (!staff) notFound();

  return (
    <>
      <PageHeader
        title="Meet the Team"
        description="Get to know the people who create, host, moderate, and care for the Ur Gay Now community."
      />
      <Container className="py-12 sm:py-16">
        <Link href="/staff" className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
          </svg>
          Back to team directory
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <section className="card overflow-hidden">
            <div className="relative aspect-square bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/30">
              {staff.photoUrl ? (
                <Image src={staff.photoUrl} alt={`${staff.name} profile photo`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 360px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl font-bold text-brand-400 dark:text-brand-700">
                  {staff.name.charAt(0) || "?"}
                </div>
              )}
              <div className="absolute left-4 top-4">
                <RoleBadge role={normalizeRoleKey(staff.rank)} size="md" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink-900 dark:text-white">{staff.name}</h2>
                  <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-300">@{staff.vrchatUsername}</p>
                </div>
                <ReportButton contentType="STAFF_PROFILE" contentId={staff.id} contentTitle={staff.name} size="sm" variant="outline" className="rounded-full border-ink-300 text-ink-700 hover:bg-ink-100 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-800 shrink-0" />
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                  <dt className="text-ink-500 dark:text-ink-400">Rank</dt>
                  <dd className="font-semibold text-ink-900 dark:text-white">{staff.rank || "Member"}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-ink-100 pb-3 dark:border-ink-800">
                  <dt className="text-ink-500 dark:text-ink-400">Hosted events</dt>
                  <dd className="font-semibold text-ink-900 dark:text-white">{staff.hostedEvents.length}</dd>
                </div>
              </dl>
              {staff.socials && <StaffSocialLinks socials={staff.socials} />}
            </div>
          </section>

          <div className="space-y-6">
            <section className="card p-6 sm:p-8">
              <p className="eyebrow">About {staff.name}</p>
              <h2 className="mt-2 text-2xl font-bold text-ink-900 dark:text-white">Profile</h2>
              <div className="prose prose-brand max-w-none dark:prose-invert">
                <Markdown content={staff.bio || "This team member has not added a bio yet."} />
              </div>
            </section>

            {staff.hostedEvents.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow">Community calendar</p>
                    <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Hosted events</h2>
                  </div>
                  <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-300">{staff.hostedEvents.length}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {staff.hostedEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover dark:border-ink-800 dark:bg-ink-900 dark:hover:border-brand-700">
                      <div className="relative h-36 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/30">
                        {event.coverImage ? (
                          <Image src={event.coverImage} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl text-brand-400 dark:text-brand-700">📅</div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="font-semibold text-ink-900 dark:text-white">{event.title}</h3>
                        <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-300">
                          {formatDate(event.startDateTime, { timeZone: event.timezone, month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {event.location && <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{event.location}</p>}
                        {event.summary && <p className="mt-3 line-clamp-2 text-sm text-ink-500 dark:text-ink-400">{event.summary}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
