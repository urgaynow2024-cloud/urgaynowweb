import Link from "next/link";
import { createEvent } from "../actions";
import { EventForm } from "../EventForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconCalendar } from "@/components/admin/ui/icons";

export default function NewEventPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Events", href: "/admin/events" }, { label: "New" }]}
        title="Add event"
        description="Schedule a new meetup, race, or community event."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Event details" subtitle="Cover images are uploaded to secure storage" icon={<IconCalendar size={18} />} />
        <CardBody>
          <EventForm action={createEvent} />
        </CardBody>
      </Card>
    </div>
  );
}
