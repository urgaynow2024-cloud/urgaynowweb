import type { ReactNode } from "react";

/**
 * Thin passthrough wrapper.
 *
 * The admin chrome (sidebar + top bar) is provided exactly once by
 * `app/admin/layout.tsx` via <AdminShell>. List pages still wrap their
 * content in <AdminLayout> for readability, but this must NOT render
 * a second shell — doing so previously nested a full sidebar/top bar
 * inside the content area, making the dashboard look like a small
 * "embedded preview" of itself.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
