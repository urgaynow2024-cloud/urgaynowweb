import Link from "next/link";
import { createStaff } from "../actions";
import { StaffForm } from "../StaffForm";

export default function NewStaffPage() {
  return (
    <div>
      <Link href="/admin/staff" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
        ← Back to staff
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Add staff member</h1>
      <div className="card">
        <StaffForm action={createStaff} />
      </div>
    </div>
  );
}
