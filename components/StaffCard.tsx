import Link from "next/link";
import { parseSocials } from "@/lib/utils";

export type StaffCardData = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  socials: string;
};

export function StaffCard({ staff }: { staff: StaffCardData }) {
  const socials = parseSocials(staff.socials);
  const photo = staff.photoUrl || "/placeholder-avatar.svg";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-48 bg-pride-gradient-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={`${staff.name} avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow dark:bg-zinc-900/90 dark:text-brand-200">
          {staff.rank}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{staff.name}</h3>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">
          @{staff.vrchatUsername}
        </p>
        {staff.bio && (
          <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            {staff.bio}
          </p>
        )}
        {socials.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 pt-2">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200"
              >
                {s.label || "Link"}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
