import Link from "next/link";
import { createRule } from "../actions";
import { RuleForm } from "../RuleForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconBook } from "@/components/admin/ui/icons";

export default function NewRulePage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Rules", href: "/admin/rules" }, { label: "New" }]}
        title="Add rule"
        description="Create a single rule. For managing many at once, use the bulk editor."
      />
      <Card>
        <CardHeader title="Rule details" icon={<IconBook size={18} />} />
        <CardBody>
          <RuleForm action={createRule} />
        </CardBody>
      </Card>
    </div>
  );
}
