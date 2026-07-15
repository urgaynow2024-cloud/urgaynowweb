import { buildStatusAtom } from "@/lib/status/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = await buildStatusAtom(process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com").catch(
    () =>
      `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Ur Gay Now — System Status</title></feed>`,
  );
  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
