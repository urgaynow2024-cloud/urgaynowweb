import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateEvent } from "../actions";
import { EventForm, type EventFormValues } from "../EventForm";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const e = await prisma.event.findUnique({ where: { id: params.id } });
  if (!e) notFound();

  const initial: EventFormValues = {
    title: e.title,
    description: e.description,
    location: e.location,
    vrchatWorldUrl: e.vrchatWorldUrl,
    coverImage: e.coverImage,
    startDateTime: e.startDateTime.toISOString(),
    endDateTime: e.endDateTime ? e.endDateTime.toISOString() : "",
    published: e.published,
  };

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to events
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit event</h1>
      <div className="card">
        <EventForm action={updateEvent.bind(null, e.id)} initial={initial} />
      </div>
    </div>
  );
}
