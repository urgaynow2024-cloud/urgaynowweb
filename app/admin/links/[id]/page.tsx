import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateLink } from "../actions";
import { LinkForm, type LinkFormValues } from "../LinkForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconLink } from "@/components/admin/ui/icons";

export default async function EditLinkPage({ params }: { params: { id: string } }) {
  const l = await prisma.link.findUnique({ where: { id: params.id } });
  if (!l) notFound();

  const initial: LinkFormValues = {
    label: l.label,
    url: l.url,
    icon: l.icon,
    sortOrder: l.sortOrder,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Links", href: "/admin/links" }, { label: "Edit" }]}
        title={`Edit: ${l.label}`}
        description="Update this link."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Link details" icon={<IconLink size={18} />} />
        <CardBody>
          <LinkForm action={updateLink.bind(null, l.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
