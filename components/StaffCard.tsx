import Image from "next/image";
import { parseSocials, type Social } from "@/lib/utils";

export type StaffCardData = {
  id: string;
  name: string;
  vrchatUsername: string;
  rank: string;
  bio: string;
  photoUrl: string;
  socials: string;
};

type Platform = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

function detectPlatform(s: Social): Platform {
  const url = s.url.toLowerCase();
  const label = (s.label || "").toLowerCase();

  if (url.includes("discord.com") || url.includes("discord.gg") || label.includes("discord")) {
    return {
      key: "discord",
      label: s.label || "Discord",
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.953-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.953 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.953-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.946 2.419-2.157 2.419Z" />
        </svg>
      ),
    };
  }

  if (url.includes("vrchat.com") || label.includes("vrchat") || label.includes("vr chat")) {
    return {
      key: "vrchat",
      label: s.label || "VRChat",
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.5 3.6v7.8L12 19.7 5.5 15.7V7.9L12 4.3ZM12 7c-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.4V17h4v-2.6c1.2-.6 2-1.9 2-3.4 0-2.2-1.8-4-4-4Zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2Z" />
        </svg>
      ),
    };
  }

  if (url.includes("twitter.com") || url.includes("x.com") || label.includes("twitter") || label.includes("x.com")) {
    return { key: "x", label: s.label || "Twitter / X", icon: <span className="text-xs font-bold">X</span> };
  }

  if (url.includes("instagram.com") || label.includes("instagram")) {
    return { key: "instagram", label: s.label || "Instagram", icon: <span className="text-xs font-bold">IG</span> };
  }

  if (url.includes("bsky.app") || label.includes("bluesky") || label.includes("bsky")) {
    return { key: "bsky", label: s.label || "BlueSky", icon: <span className="text-xs font-bold">BS</span> };
  }

  if (url.includes("tiktok.com") || label.includes("tiktok")) {
    return { key: "tiktok", label: s.label || "TikTok", icon: <span className="text-xs font-bold">TT</span> };
  }

  if (url.includes("youtube.com") || url.includes("youtu.be") || label.includes("youtube")) {
    return { key: "youtube", label: s.label || "YouTube", icon: <span className="text-xs font-bold">YT</span> };
  }

  return {
    key: "link",
    label: s.label || "Link",
    icon: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
}

export function StaffCard({ staff }: { staff: StaffCardData }) {
  const socials = parseSocials(staff.socials);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-brand-500/5 dark:focus-visible:ring-offset-ink-950">
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
            {socials.map((s, i) => {
              const platform = detectPlatform(s);
              return (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={platform.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 dark:border-brand-800/60 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:border-brand-600"
                >
                  {platform.icon}
                  {platform.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
