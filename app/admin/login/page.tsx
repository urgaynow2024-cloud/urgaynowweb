import Link from "next/link";
import { login } from "./actions";
import { IconExternal } from "@/components/admin/ui/icons";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  return (
    <div className="admin-bg flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pride-gradient text-2xl shadow-glow">
            🏳️‍🌈
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Admin Console</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Sign in to manage Ur Gay Now</p>
        </div>

        <div className="card p-6">
          {searchParams.error && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {searchParams.error === "1"
                ? "Invalid username or password. Please try again."
                : "Admin account is not configured yet."}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="username">Username</label>
              <input id="username" name="username" className="input" required autoComplete="username" placeholder="admin" />
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="input" required autoComplete="current-password" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-300">
            <IconExternal size={15} /> Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
