import Image from "next/image";
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

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30">
        {staff.photoUrl && (
          <Image
            src={staff.photoUrl}
            alt={`${staff.name} avatar`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-brand-200">
          {staff.rank}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{staff.name}</h3>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">
          @{staff.vrchatUsername}
        </p>
        {staff.bio && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {staff.bio}
          </p>
        )}
        {socials.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
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
