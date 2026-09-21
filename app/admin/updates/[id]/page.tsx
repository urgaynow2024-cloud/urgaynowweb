import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateUpdate, retryUpdateWebhook, regenerateSummary } from "../actions";
import { UpdateForm, type UpdateFormValues } from "../UpdateForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { ErrorAnnouncer } from "@/components/admin/ErrorAnnouncer";
import { IconMegaphone, IconRefresh, IconZap } from "@/components/admin/ui/icons";
import { Suspense } from "react";

export default async function EditUpdatePage({ params }: { params: { id: string } }) {
  const u = await prisma.update.findUnique({ where: { id: params.id } });
  if (!u) notFound();

  const initial: UpdateFormValues = {
    version: u.version,
    type: u.type as "MAJOR" | "MINOR" | "PATCH",
    title: u.title,
    summary: u.summary,
    whatsNew: u.whatsNew,
    improvements: u.improvements,
    bugFixes: u.bugFixes,
    securityNotes: u.securityNotes,
    images: u.images,
    authorId: u.authorId,
    published: !!u.publishedAt,
    postToDiscord: u.discordPostStatus === "failed" ? false : !!u.discordPostedAt,
    generatedAutomatically: u.generatedAutomatically,
    releaseStatus: u.releaseStatus as "DRAFT" | "PUBLISHED" | "FAILED",
    sourceCommit: u.sourceCommit || undefined,
    sourceBranch: u.sourceBranch || undefined,
    deploymentId: u.deploymentId || undefined,
  };

  return (
    <div>
      <Suspense fallback={null}>
        <ErrorAnnouncer />
      </Suspense>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Updates", href: "/admin/updates" }, { label: "Edit" }]}
        title={`Edit: ${u.title}`}
        description="Update this changelog entry and its settings."
        actions={
          <>
            {u.discordPostStatus === "failed" && (
              <form action={retryUpdateWebhook.bind(null, u.id)}>
                <button type="submit" className="btn-secondary btn-sm">
                  <IconRefresh size={14} /> Retry Discord post
                </button>
              </form>
            )}
            {u.generatedAutomatically && (
              <form action={(formData) => regenerateSummary(u.id, formData)}>
                <button type="submit" className="btn-secondary btn-sm">
                  <IconZap size={14} className="mr-1" /> Regenerate summary
                </button>
              </form>
            )}
          </>
        }
      />
      <Card className="animate-fade-in">
        <CardHeader title="Update details" icon={<IconMegaphone size={18} />} />
        <CardBody>
          <UpdateForm action={(formData) => updateUpdate(u.id, formData)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}