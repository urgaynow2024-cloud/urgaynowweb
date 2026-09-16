import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { updateEvent, retryEventWebhook } from "../actions";
import { EventForm, type EventFormValues } from "../EventForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { IconCalendar, IconRefresh } from "@/components/admin/ui/icons";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const e = await prisma.event.findUnique({ where: { id: params.id } });
  if (!e) notFound();

  const initial: EventFormValues = {
    title: e.title,
    summary: e.summary,
    description: e.description,
    location: e.location,
    vrchatWorldUrl: e.vrchatWorldUrl,
    coverImage: e.coverImage,
    startDateTime: e.startDateTime.toISOString(),
    endDateTime: e.endDateTime ? e.endDateTime.toISOString() : "",
    timezone: e.timezone,
    hostName: e.hostName,
    category: e.category,
    tags: e.tags,
    rules: e.rules,
    published: e.published,
    postToDiscord: e.discordPostStatus === "failed" ? false : e.discordPosted,
    discordRoleIds: e.discordRoleIds,
  };

  return (
    <div>
      <Suspense fallback={null}>
        <ErrorAnnouncer />
      </Suspense>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Events", href: "/admin/events" }, { label: "Edit" }]}
        title={`Edit: ${e.title}`}
        description="Update event details, times, visibility, and discovery metadata."
        actions={
          e.discordPostStatus === "failed" && (
            <form action={retryEventWebhook.bind(null, e.id)}>
              <button type="submit" className="btn-secondary btn-sm">
                <IconRefresh size={14} /> Retry Discord post
              </button>
            </form>
          )
        }
      />
      <Card className="animate-fade-in">
        <CardHeader title="Event details" icon={<IconCalendar size={18} />} />
        <CardBody>
          <EventForm action={(formData) => updateEvent(e.id, formData)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
