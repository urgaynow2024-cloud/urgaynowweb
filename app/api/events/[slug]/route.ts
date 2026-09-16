import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEventState } from "@/lib/event-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get("preview");
    const previewToken = searchParams.get("token");

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        host: {
          select: { id: true, name: true, vrchatUsername: true, photoUrl: true, createdAt: true, updatedAt: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if published or has valid preview access
    const now = new Date();
    const state = getEventState(event as any, now);

    const isPublished = event.published === true;
    const isPreview = preview === "true" && previewToken;

    if (!isPublished && !isPreview) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate preview token (simple check - in production use signed token)
    if (isPreview && previewToken !== `preview-${event.id}`) {
      return NextResponse.json({ error: "Invalid preview token" }, { status: 403 });
    }

    // Fetch related events (same category or overlapping tags, upcoming only, exclude self)
    const relatedEvents = await prisma.event.findMany({
      where: {
        id: { not: event.id },
        published: true,
        OR: [
          { category: event.category },
          { tags: { hasSome: event.tags || [] } },
        ],
        startDateTime: { gte: now },
      },
      orderBy: { startDateTime: "asc" },
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        startDateTime: true,
        endDateTime: true,
        timezone: true,
        category: true,
        tags: true,
        hostName: true,
        location: true,
      },
    });

    return NextResponse.json({
      event: {
        ...event,
        state,
        isPublished,
        isPreview,
      },
      relatedEvents,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}