import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { SocialLink } from "@/lib/nav-links";
import { safeQuery } from "@/lib/safeQuery";

const SOCIAL_KEYS = [
  "socialDiscord",
  "socialTwitter",
  "socialInstagram",
  "socialTiktok",
  "socialYoutube",
] as const;

const SOCIAL_LABELS: Record<(typeof SOCIAL_KEYS)[number], string> = {
  socialDiscord: "Discord",
  socialTwitter: "Twitter / X",
  socialInstagram: "Instagram",
  socialTiktok: "TikTok",
  socialYoutube: "YouTube",
};

async function fetchFooterSocials(): Promise<SocialLink[]> {
  const [linkRows, settingRows] = await Promise.all([
    prisma.link.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.setting.findMany({
      where: { key: { in: [...SOCIAL_KEYS] } },
      select: { key: true, value: true },
    }),
  ]);
  const socialMap = Object.fromEntries(settingRows.map((s) => [s.key, s.value]));
  const out: SocialLink[] = linkRows.map((s) => ({ label: s.label, url: s.url }));
  for (const key of SOCIAL_KEYS) {
    const value = socialMap[key];
    if (value) out.push({ label: SOCIAL_LABELS[key], url: value });
  }
  return out;
}

// Cached so the footer's DB queries run once per build/revalidation instead of
// once per page (the footer renders in the root layout on every route). The
// safeQuery fallback keeps static prerendering from throwing if the database
// is unreachable during `next build` (e.g. a busy connection pool).
const getCachedFooterSocials = unstable_cache(
  () => safeQuery(fetchFooterSocials, [] as SocialLink[]),
  ["footer-socials"],
  { revalidate: 300 },
);

export async function getFooterSocials(): Promise<SocialLink[]> {
  return getCachedFooterSocials();
}
