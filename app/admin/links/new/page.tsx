import { createLink } from "../actions";
import { LinkForm } from "../LinkForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconLink } from "@/components/admin/ui/icons";

export default function NewLinkPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Links", href: "/admin/links" }, { label: "New" }]}
        title="New link"
        description="Add an external link or quick-access button."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Link details" icon={<IconLink size={18} />} />
        <CardBody>
          <LinkForm action={createLink} />
        </CardBody>
      </Card>
    </div>
  );
}
