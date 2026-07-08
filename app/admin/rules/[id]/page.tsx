import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateRule } from "../actions";
import { RuleForm, type RuleFormValues } from "../RuleForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconBook } from "@/components/admin/ui/icons";

export default async function EditRulePage({ params }: { params: { id: string } }) {
  const r = await prisma.rule.findUnique({ where: { id: params.id } });
  if (!r) notFound();

  const initial: RuleFormValues = {
    category: r.category,
    title: r.title,
    content: r.content,
    sortOrder: r.sortOrder,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Rules", href: "/admin/rules" }, { label: "Edit" }]}
        title={`Edit: ${r.title}`}
        description="Update this rule's category, title, and details."
      />
      <Card>
        <CardHeader title="Rule details" icon={<IconBook size={18} />} />
        <CardBody>
          <RuleForm action={updateRule.bind(null, r.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
