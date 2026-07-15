import type { Metadata } from "next";
import { ApiExplorer } from "@/components/ApiExplorer";

export const metadata: Metadata = {
  title: "API · Ur Gay Now",
  description:
    "Public API reference and live explorer for Ur Gay Now — call the status endpoint right from your browser.",
};

const ENDPOINTS: {
  method: "GET" | "POST";
  path: string;
  access: string;
  desc: string;
}[] = [
  {
    method: "GET",
    path: "/api/status/now",
    access: "Public",
    desc: "Live overall system-status snapshot.",
  },
  {
    method: "POST",
    path: "/api/status/subscribe",
    access: "Public",
    desc: "Subscribe to status updates via email or Discord webhook.",
  },
  {
    method: "GET",
    path: "/status/rss.xml",
    access: "Public",
    desc: "Status updates as an RSS feed.",
  },
  {
    method: "GET",
    path: "/status/atom.xml",
    access: "Public",
    desc: "Status updates as an Atom feed.",
  },
  {
    method: "POST",
    path: "/api/gallery/submit",
    access: "Public",
    desc: "Submit a gallery photo (rate-limited, honeypot-protected).",
  },
  {
    method: "POST",
    path: "/api/blob",
    access: "Public",
    desc: "Get a scoped presigned URL to upload gallery images to Blob.",
  },
  {
    method: "POST",
    path: "/api/status/now",
    access: "Internal",
    desc: "Trigger a health-check pass (Vercel Cron / admin console).",
  },
  {
    method: "GET",
    path: "/api/admin/rules",
    access: "Admin",
    desc: "List community rules (requires an admin session).",
  },
  {
    method: "POST",
    path: "/api/upload",
    access: "Admin",
    desc: "Upload an image to Blob storage (requires an admin session).",
  },
  {
    method: "POST",
    path: "/api/discord/webhook?secret=…",
    access: "Secret",
    desc: "Import a Discord message as the latest announcement.",
  },
];

const METHOD_CLASS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  POST: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

const ACCESS_CLASS: Record<string, string> = {
  Public: "badge-success",
  Internal: "badge-brand",
  Admin: "badge-warning",
  Secret: "badge-danger",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
      {children}
    </h2>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20">
      <header className="pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
          Ur Gay Now
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          API
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Programmatic access to Ur Gay Now. The endpoint below is public and safe to call from
          the browser — try it live.
        </p>
      </header>

      {/* Explorer */}
      <section className="mt-10">
        <SectionTitle>Explorer</SectionTitle>
        <p className="mb-4 text-xs text-zinc-400">
          GET /api/status/now — the current system-status snapshot
        </p>
        <ApiExplorer />
      </section>

      {/* Endpoints */}
      <section className="mt-10">
        <SectionTitle>Endpoints</SectionTitle>
        <p className="mb-4 text-xs text-zinc-400">Available routes and their access level</p>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-ink-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {ENDPOINTS.map((e) => (
                  <tr key={e.method + e.path} className="bg-white dark:bg-zinc-950">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${METHOD_CLASS[e.method]}`}
                      >
                        {e.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-zinc-800 dark:text-zinc-100">
                        {e.path}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ACCESS_CLASS[e.access] ?? "badge-neutral"}`}>{e.access}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{e.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="mt-10">
        <SectionTitle>Notes</SectionTitle>
        <ul className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-ink-900 dark:text-zinc-400">
          <li>
            All responses are <code className="font-mono">application/json</code> and the status
            snapshot sets <code className="font-mono">Cache-Control: no-store</code>.
          </li>
          <li>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Public</span> routes need no
            authentication. <span className="font-medium text-zinc-800 dark:text-zinc-200">Admin</span> and{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">Internal</span> routes require a
            session or an authorised caller.
          </li>
          <li>
            The status endpoint is designed to stay useful during a database outage by falling
            back to a cached snapshot and a live probe.
          </li>
        </ul>
      </section>

      <footer className="mt-12 text-center text-xs text-zinc-400">
        Prefer the visual dashboard? Visit{" "}
        <a href="/status" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          /status
        </a>
        .
      </footer>
    </div>
  );
}
