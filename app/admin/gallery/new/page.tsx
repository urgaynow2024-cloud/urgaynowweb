import Link from "next/link";
import { createGalleryImage } from "../actions";
import { ImageItemForm } from "@/components/admin/ImageItemForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconImages } from "@/components/admin/ui/icons";

export default function NewGalleryImagePage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Gallery", href: "/admin/gallery" }, { label: "New" }]}
        title="Add gallery image"
        description="Upload an image to the gallery."
      />
      <Card>
        <CardHeader title="Image details" subtitle="Images are uploaded to secure storage" icon={<IconImages size={18} />} />
        <CardBody>
          <ImageItemForm action={createGalleryImage} />
        </CardBody>
      </Card>
    </div>
  );
}
