import { buildStatusRss } from "@/lib/status/rss";

export const revalidate = 30;

export async function GET() {
  const xml = await buildStatusRss(process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").catch(
    () => `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Ur Gay Now — System Status</title></channel></rss>`,
  );
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
