import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateStaff } from "../actions";
import { StaffForm, type StaffFormValues } from "../StaffForm";
import { parseSocials } from "@/lib/utils";

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
      <Link href="/admin/staff" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to staff
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Edit {s.name}</h1>
      <div className="card">
        <StaffForm action={updateStaff.bind(null, s.id)} initial={initial} />
      </div>
    </div>
  );
}
