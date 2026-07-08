import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGuide } from "../actions";
import { GuideForm, type GuideFormValues } from "../GuideForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconBook } from "@/components/admin/ui/icons";

export default async function EditGuidePage({ params }: { params: { id: string } }) {
  const g = await prisma.guide.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: GuideFormValues = {
    category: g.category,
    question: g.question,
    answer: g.answer,
    sortOrder: g.sortOrder,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Guides & FAQ", href: "/admin/guides" }, { label: "Edit" }]}
        title={`Edit: ${g.question}`}
        description="Update this help article."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Guide details" icon={<IconBook size={18} />} />
        <CardBody>
          <GuideForm action={updateGuide.bind(null, g.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
