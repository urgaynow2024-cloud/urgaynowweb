import Link from "next/link";
import { createAnnouncement } from "../actions";
import { AnnouncementForm } from "../AnnouncementForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconMegaphone } from "@/components/admin/ui/icons";

export default function NewAnnouncementPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Announcements", href: "/admin/announcements" }, { label: "New" }]}
        title="Add announcement"
        description="Create a new post or update for your community."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Announcement details" subtitle="Cover images are uploaded to secure storage" icon={<IconMegaphone size={18} />} />
        <CardBody>
          <AnnouncementForm action={createAnnouncement} />
        </CardBody>
      </Card>
    </div>
  );
}
