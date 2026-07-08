import { getAllSettings } from "@/lib/settings";
import { updateSettings } from "./actions";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings", robots: { index: false, follow: false } };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const settings = await getAllSettings();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-zinc-900 dark:text-white">Site settings</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Update homepage copy, about page, support info, and social links.
      </p>

      {searchParams.saved && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          Settings saved ✓
        </div>
      )}

      <SettingsForm action={updateSettings} initial={settings} />
    </div>
  );
}
