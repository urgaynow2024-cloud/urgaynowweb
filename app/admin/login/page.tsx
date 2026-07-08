import Link from "next/link";
import { login } from "./actions";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl" aria-hidden>🏳️‍🌈</div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Staff Login</h1>
          <p className="mt-1 text-sm text-zinc-500">Ur Gay Now admin dashboard</p>
        </div>
        {searchParams.error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {searchParams.error === "1"
              ? "Invalid username or password. Please try again."
              : "Admin account is not configured yet."}
          </div>
        )}
        <form action={login} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" name="username" className="input" required autoComplete="username" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" required autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full" type="submit">Log in</button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-brand-600">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
