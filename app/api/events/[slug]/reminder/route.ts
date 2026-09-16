import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getEventState } from "@/lib/event-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { remindAt } = body as { remindAt?: string };

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true, startDateTime: true, published: true, status: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.published) {
      return NextResponse.json({ error: "Event not published" }, { status: 403 });
    }

    const state = getEventState(event as any, new Date());
    if (state === "PAST" || state === "ARCHIVED" || event.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot set reminder for past/cancelled event" }, { status: 400 });
    }

    // Default to 1 hour before if not specified
    const eventStart = new Date(event.startDateTime);
    let reminderTime: Date;

    if (remindAt) {
      reminderTime = new Date(remindAt);
      if (Number.isNaN(reminderTime.getTime())) {
        return NextResponse.json({ error: "Invalid remindAt date" }, { status: 400 });
      }
    } else {
      // Default: 1 hour before
      reminderTime = new Date(eventStart.getTime() - 60 * 60 * 1000);
    }

    // Validate reminder is before event start
    if (reminderTime >= eventStart) {
      return NextResponse.json({ error: "Reminder must be before event start" }, { status: 400 });
    }

    // Check if user already has a reminder for this event at this time
    const existing = await prisma.eventReminder.findUnique({
      where: {
        userId_eventId_remindAt: {
          userId: session.sub,
          eventId: event.id,
          remindAt: reminderTime,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Reminder already exists" }, { status: 409 });
    }

    const reminder = await prisma.eventReminder.create({
      data: {
        userId: session.sub,
        eventId: event.id,
        remindAt: reminderTime,
      },
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const remindAt = searchParams.get("remindAt");

    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let whereClause;
    if (remindAt) {
      const reminderTime = new Date(remindAt);
      if (Number.isNaN(reminderTime.getTime())) {
        return NextResponse.json({ error: "Invalid remindAt date" }, { status: 400 });
      }
      whereClause = {
        userId: session.sub,
        eventId: event.id,
        remindAt: reminderTime,
      };
    } else {
      // Delete all reminders for this user/event
      whereClause = {
        userId: session.sub,
        eventId: event.id,
      };
    }

    await prisma.eventReminder.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}