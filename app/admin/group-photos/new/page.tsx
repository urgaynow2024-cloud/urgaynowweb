import { createGroupPhoto } from "../actions";
import { GroupPhotoForm } from "@/components/admin/GroupPhotoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconCamera } from "@/components/admin/ui/icons";

export default function NewGroupPhotoPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Group Photos", href: "/admin/group-photos" }, { label: "New" }]}
        title="Upload group photo"
        description="Add a new group or team photo. You can set a banner and rules."
      />
      <Card>
        <CardHeader title="Photo details" subtitle="Fill in the information below" icon={<IconCamera size={18} />} />
        <CardBody>
          <GroupPhotoForm action={createGroupPhoto} folder="group-photos" />
        </CardBody>
      </Card>
    </div>
  );
}
