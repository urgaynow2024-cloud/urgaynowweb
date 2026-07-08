import Link from "next/link";
import { createStaff } from "../actions";
import { StaffForm } from "../StaffForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconUsers } from "@/components/admin/ui/icons";

export default function NewStaffPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Staff", href: "/admin/staff" }, { label: "New" }]}
        title="Add staff member"
        description="Add a new person to the team directory."
      />
      <Card>
        <CardHeader title="Staff details" subtitle="Photos are uploaded to secure storage" icon={<IconUsers size={18} />} />
        <CardBody>
          <StaffForm action={createStaff} />
        </CardBody>
      </Card>
    </div>
  );
}
