import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboard() {
  const [
    staffCount,
    announcementCount,
    eventCount,
    ruleCount,
    guideCount,
    linkCount,
    galleryCount,
    groupCount,
  ] = await Promise.all([
    prisma.staff.count(),
    prisma.announcement.count(),
    prisma.event.count(),
    prisma.rule.count(),
    prisma.guide.count(),
    prisma.link.count(),
    prisma.galleryImage.count(),
    prisma.groupPhoto.count(),
  ]);

  const cards = [
    { label: "Staff", count: staffCount, href: "/admin/staff" },
    { label: "Announcements", count: announcementCount, href: "/admin/announcements" },
    { label: "Events", count: eventCount, href: "/admin/events" },
    { label: "Rules", count: ruleCount, href: "/admin/rules" },
    { label: "Guides / FAQ", count: guideCount, href: "/admin/guides" },
    { label: "Links", count: linkCount, href: "/admin/links" },
    { label: "Group Photos", count: groupCount, href: "/admin/group-photos" },
    { label: "Gallery", count: galleryCount, href: "/admin/gallery" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Dashboard</h1>
      <p className="mb-6 text-sm text-zinc-500">Manage everything for Ur Gay Now from here.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card flex flex-col items-start transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-300">{c.count}</span>
            <span className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 card">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Tips</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Upload images using the upload button in any form — they’re stored securely.</li>
          <li>Content supports Markdown (headings, lists, links, bold).</li>
          <li>Edit your homepage copy and socials under <Link href="/admin/settings" className="text-brand-600 hover:underline">Settings</Link>.</li>
          <li>Always click “Save” — changes go live immediately.</li>
        </ul>
      </div>
    </div>
  );
}
