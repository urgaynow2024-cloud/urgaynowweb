import Link from "next/link";
import { createGroupPhoto } from "../actions";
import { GroupPhotoForm } from "@/components/admin/GroupPhotoForm";

export default function NewGroupPhotoPage() {
  return (
    <div>
      <Link href="/admin/group-photos" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to group photos
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Upload group photo</h1>
      <div className="card">
        <GroupPhotoForm action={createGroupPhoto} folder="group-photos" />
      </div>
    </div>
  );
}
