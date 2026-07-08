import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateEvent } from "../actions";
import { EventForm, type EventFormValues } from "../EventForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconCalendar } from "@/components/admin/ui/icons";

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
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Events", href: "/admin/events" }, { label: "Edit" }]}
        title={`Edit: ${e.title}`}
        description="Update event details, times, and visibility."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Event details" icon={<IconCalendar size={18} />} />
        <CardBody>
          <EventForm action={updateEvent.bind(null, e.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
