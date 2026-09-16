import { prisma } from "@/lib/db";
import { createUpdate, suggestVersion } from "../actions";
import { UpdateForm, type UpdateFormValues } from "../UpdateForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { IconMegaphone } from "@/components/admin/ui/icons";
import { Suspense } from "react";

export default async function NewUpdatePage() {
  const suggestedPatch = await suggestVersion("PATCH").catch(() => "");
  const suggestedMinor = await suggestVersion("MINOR").catch(() => "");
  const suggestedMajor = await suggestVersion("MAJOR").catch(() => "");

  const initial: UpdateFormValues = {
    version: suggestedPatch,
    type: "PATCH",
    title: "",
    summary: "",
    whatsNew: "",
    improvements: "",
    bugFixes: "",
    securityNotes: "",
    images: "[]",
    authorId: "",
    published: false,
    postToDiscord: false,
  };

  return (
    <div>
      <Suspense fallback={null}>
        <ErrorAnnouncer />
      </Suspense>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Updates", href: "/admin/updates" }, { label: "New" }]}
        title="Add update"
        description="Create a new changelog entry. Version numbers are suggested automatically."
      />
      <Card className="animate-fade-in">
        <CardHeader title="Update details" icon={<IconMegaphone size={18} />} />
        <CardBody>
          <UpdateForm action={createUpdate} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}