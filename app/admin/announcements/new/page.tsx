import Link from "next/link";
import { createAnnouncement } from "../actions";
import { AnnouncementForm } from "../AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div>
      <Link href="/admin/announcements" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to announcements
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add announcement</h1>
      <div className="card">
        <AnnouncementForm action={createAnnouncement} />
      </div>
    </div>
  );
}
