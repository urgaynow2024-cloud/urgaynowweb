import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// The status dashboard and the API reference now live on one page (/status).
// Redirect the old /api route there so existing links still resolve.
export default function ApiRedirect() {
  redirect("/status#api");
}
