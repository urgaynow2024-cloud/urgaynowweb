import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateAnnouncement, retryAnnouncementWebhook } from "../actions";
import { AnnouncementForm, type AnnouncementFormValues } from "../AnnouncementForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { IconMegaphone, IconRefresh } from "@/components/admin/ui/icons";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const a = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!a) notFound();

  const initial: AnnouncementFormValues = {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    state: a.state as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    publishedAt: a.publishedAt?.toISOString() || "",
    scheduledAt: a.scheduledAt?.toISOString() || "",
    categoryId: a.categoryId || "",
    authorId: a.authorId || "",
    pinned: a.pinned,
    postToDiscord: a.discordPostStatus === "failed" ? false : a.discordPosted,
    discordRoleIds: a.discordRoleIds,
  };

  return (
    <div>
      <Suspense fallback={null}>
        <ErrorAnnouncer />
      </Suspense>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Announcements", href: "/admin/announcements" }, { label: "Edit" }]}
        title={`Edit: ${a.title}`}
        description="Update this announcement and its settings."
        actions={
          a.discordPostStatus === "failed" && (
            <form action={retryAnnouncementWebhook.bind(null, a.id)}>
              <button type="submit" className="btn-secondary btn-sm">
                <IconRefresh size={14} /> Retry Discord post
              </button>
            </form>
          )
        }
      />
      <Card className="animate-fade-in">
        <CardHeader title="Announcement details" icon={<IconMegaphone size={18} />} />
        <CardBody>
          <AnnouncementForm action={updateAnnouncement.bind(null, a.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
