import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGroupPhoto } from "../actions";
import { GroupPhotoForm, type GroupPhotoFormValues } from "@/components/admin/GroupPhotoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconCamera } from "@/components/admin/ui/icons";

export default async function EditGroupPhotoPage({ params }: { params: { id: string } }) {
  const g = await prisma.groupPhoto.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: GroupPhotoFormValues = {
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    bannerUrl: g.bannerUrl || "",
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Group Photos", href: "/admin/group-photos" }, { label: "Edit" }]}
        title={`Edit: ${g.title}`}
        description="Update the photo and banner."
      />
      <Card>
        <CardHeader title="Photo details" subtitle="Changes save immediately" icon={<IconCamera size={18} />} />
        <CardBody>
          <GroupPhotoForm action={updateGroupPhoto.bind(null, g.id)} initial={initial} folder="group-photos" />
        </CardBody>
      </Card>
    </div>
  );
}
