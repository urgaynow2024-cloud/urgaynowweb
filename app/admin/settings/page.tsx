import { getAllSettings } from "@/lib/settings";
import { updateSettings } from "./actions";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconFileText, IconShield, IconBook, IconSettings } from "@/components/admin/ui/icons";
import { SettingsForm } from "./SettingsForm";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata = { title: "Settings", robots: { index: false, follow: false } };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const settings = await getAllSettings();

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]}
        title="Site settings"
        description="Update homepage copy, about page, support info, and social links."
      />

      {searchParams.saved && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Settings saved
        </div>
      )}

      <SettingsForm action={updateSettings} initial={settings} />
    </AdminLayout>
  );
}
