import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateGalleryImage } from "../actions";
import { ImageItemForm, type ImageItemFormValues } from "@/components/admin/ImageItemForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconImages } from "@/components/admin/ui/icons";

export default async function EditGalleryImagePage({ params }: { params: { id: string } }) {
  const g = await prisma.galleryImage.findUnique({ where: { id: params.id } });
  if (!g) notFound();

  const initial: ImageItemFormValues = {
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Gallery", href: "/admin/gallery" }, { label: "Edit" }]}
        title={`Edit: ${g.title}`}
        description="Update this gallery image."
      />
      <Card>
        <CardHeader title="Image details" icon={<IconImages size={18} />} />
        <CardBody>
          <ImageItemForm action={updateGalleryImage.bind(null, g.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
