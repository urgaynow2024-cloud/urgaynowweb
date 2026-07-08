import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { RulesEditor } from "@/components/admin/RulesEditor";
import { IconBook, IconPlus } from "@/components/admin/ui/icons";
import Link from "next/link";

export const metadata = { title: "Rules", robots: { index: false, follow: false } };

export default async function AdminRulesList() {
  const rows = await prisma.rule.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  const initial = rows.map((r, i) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    content: r.content,
    sortOrder: i,
  }));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Rules" }]}
        title="Community Rules"
        description={initial.length === 0 ? "Import rules in bulk by dragging a .txt or .json file, or add them manually below." : "Edit every rule in one place. Drag to reorder, duplicate, preview markdown, and import or export in bulk."}
        actions={
          <Link href="/admin/rules/new" className="btn-secondary btn-sm">
            <IconPlus size={16} /> Single rule
          </Link>
        }
      />

      <Card>
        <CardHeader
          title={initial.length === 0 ? "Import or create rules" : "Bulk rule editor"}
          subtitle="All changes save together"
          icon={<IconBook size={18} />}
        />
        <CardBody>
          <RulesEditor initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
