import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateStaff } from "../actions";
import { StaffForm, type StaffFormValues } from "../StaffForm";
import { parseSocials } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconUsers } from "@/components/admin/ui/icons";

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const s = await prisma.staff.findUnique({ where: { id: params.id } });
  if (!s) notFound();

  const initial: StaffFormValues = {
    id: s.id,
    name: s.name,
    vrchatUsername: s.vrchatUsername,
    rank: s.rank,
    bio: s.bio,
    photoUrl: s.photoUrl,
    sortOrder: s.sortOrder,
    socials: parseSocials(s.socials),
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Staff", href: "/admin/staff" }, { label: "Edit" }]}
        title={`Edit: ${s.name}`}
        description="Update this team member's profile."
      />
      <Card>
        <CardHeader title="Staff details" icon={<IconUsers size={18} />} />
        <CardBody>
          <StaffForm action={updateStaff.bind(null, s.id)} initial={initial} />
        </CardBody>
      </Card>
    </div>
  );
}
