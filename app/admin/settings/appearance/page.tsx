import { getThemeSettings } from "./actions";
import AppearancePage from "./AppearancePage";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { IconPalette, IconArrowLeft } from "@/components/admin/ui/icons";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";

export const metadata = { title: "Appearance", robots: { index: false, follow: false } };

export default async function AdminAppearancePage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const settings = await getThemeSettings();

  return (
    <AdminLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Appearance" },
        ]}
        title="Appearance & Seasonal Themes"
        description="Configure site themes and automatic seasonal scheduling."
        actions={
          <Link href="/admin/settings" className="btn-secondary btn-sm">
            <IconArrowLeft size={14} className="mr-1" /> Back to Settings
          </Link>
        }
      />

      <Card className="animate-fade-in">
        <CardHeader title="Theme Configuration" icon={<IconPalette size={18} />} />
        <CardBody className="p-0">
          <AppearancePage initial={settings} saved={searchParams.saved} error={searchParams.error} />
        </CardBody>
      </Card>
    </AdminLayout>
  );
}