import { getSession } from "@/lib/auth";
import { getAttentionCounts } from "@/lib/admin-dashboard";
import { AdminShell } from "@/components/admin/AdminShell";

export const revalidate = 60;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getSession();
  } catch {
    session = null;
  }

  if (!session) {
    return <div className="admin-bg min-h-screen">{children}</div>;
  }

  const attention = await getAttentionCounts();
  return <AdminShell user={{ name: session.name }} attention={attention}>{children}</AdminShell>;
}
