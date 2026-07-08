import Link from "next/link";
import { createPartner } from "../actions";
import { PartnerForm } from "../PartnerForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconLink } from "@/components/admin/ui/icons";

export default function NewPartnerPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Partners", href: "/admin/partners" }, { label: "New" }]}
        title="Add partner"
        description="Add a community, group, or creator connected with UGN."
      />
      <Card>
        <CardHeader title="Partner details" subtitle="Logos are uploaded to secure storage" icon={<IconLink size={18} />} />
        <CardBody>
          <PartnerForm action={createPartner} />
        </CardBody>
      </Card>
    </div>
  );
}
