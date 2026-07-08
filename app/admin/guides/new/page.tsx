import { createGuide } from "../actions";
import { GuideForm } from "../GuideForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconBook } from "@/components/admin/ui/icons";

export default function NewGuidePage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Guides & FAQ", href: "/admin/guides" }, { label: "New" }]}
        title="New guide"
        description="Add a help article or frequently asked question."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Guide details" icon={<IconBook size={18} />} />
        <CardBody>
          <GuideForm action={createGuide} />
        </CardBody>
      </Card>
    </div>
  );
}
