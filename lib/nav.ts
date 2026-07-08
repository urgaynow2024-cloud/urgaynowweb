import "server-only";
import { prisma } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";
import type { SocialLink } from "@/lib/nav-links";

export async function getFooterSocials(): Promise<SocialLink[]> {
  const socials = await prisma.link.findMany({ orderBy: { sortOrder: "asc" } });
  const extras = await getAllSettings();
  const out: SocialLink[] = socials.map((s) => ({ label: s.label, url: s.url }));
  if (extras.socialDiscord) out.push({ label: "Discord", url: extras.socialDiscord });
  if (extras.socialTwitter) out.push({ label: "Twitter / X", url: extras.socialTwitter });
  if (extras.socialInstagram) out.push({ label: "Instagram", url: extras.socialInstagram });
  if (extras.socialTiktok) out.push({ label: "TikTok", url: extras.socialTiktok });
  if (extras.socialYoutube) out.push({ label: "YouTube", url: extras.socialYoutube });
  return out;
}
