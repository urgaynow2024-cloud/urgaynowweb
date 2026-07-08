import Link from "next/link";
import { createEvent } from "../actions";
import { EventForm } from "../EventForm";

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to events
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add event</h1>
      <div className="card">
        <EventForm action={createEvent} />
      </div>
    </div>
  );
}
