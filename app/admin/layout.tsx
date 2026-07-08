import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login page (no session) renders without the admin shell.
  if (!session) {
    return <div className="admin-bg min-h-screen">{children}</div>;
  }

  return <AdminShell user={{ name: session.name }}>{children}</AdminShell>;
}
