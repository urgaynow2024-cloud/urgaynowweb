import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateAnnouncement } from "../actions";
import { AnnouncementForm, type AnnouncementFormValues } from "../AnnouncementForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconMegaphone } from "@/components/admin/ui/icons";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const a = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!a) notFound();

  const initial: AnnouncementFormValues = {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    published: a.published,
    publishedAt: a.publishedAt.toISOString(),
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Announcements", href: "/admin/announcements" }, { label: "Edit" }]}
        title={`Edit: ${a.title}`}
        description="Update this announcement and its settings."
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
