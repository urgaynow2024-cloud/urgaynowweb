import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updatePartner } from "../actions";
import { PartnerForm, type PartnerFormValues } from "../PartnerForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconLink } from "@/components/admin/ui/icons";

export default async function EditPartnerPage({ params }: { params: { id: string } }) {
  const p = await prisma.partner.findUnique({ where: { id: params.id } });
  if (!p) notFound();

  const initial: PartnerFormValues = {
    name: p.name,
    logoUrl: p.logoUrl,
    description: p.description,
    link: p.link,
    tag: p.tag,
    sortOrder: p.sortOrder,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Partners", href: "/admin/partners" }, { label: "Edit" }]}
        title={`Edit: ${p.name}`}
        description="Update this partner's profile."
      />
      <Card>
        <CardHeader title="Partner details" icon={<IconLink size={18} />} />
        <CardBody>
          <PartnerForm action={updatePartner.bind(null, p.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
