import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateIcsEvent, getIcsFilename } from "@/lib/ics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.published) {
      return NextResponse.json({ error: "Event not published" }, { status: 403 });
    }

    const start = new Date(event.startDateTime);
    const end = event.endDateTime ? new Date(event.endDateTime) : null;

    const descriptionParts = [];
    if (event.summary) descriptionParts.push(event.summary);
    if (event.description) descriptionParts.push(event.description);
    if (event.rules) descriptionParts.push(`\nRules:\n${event.rules}`);
    if (event.vrchatWorldUrl) descriptionParts.push(`\nVRChat World: ${event.vrchatWorldUrl}`);

    const ics = generateIcsEvent({
      title: event.title,
      description: descriptionParts.join("\n\n") || undefined,
      location: event.location || event.vrchatWorldUrl || undefined,
      start,
      end,
      timezone: event.timezone,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://urgaynow.com"}/events/${event.slug}`,
    });

    const filename = getIcsFilename({ title: event.title, start });

    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating ICS:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}