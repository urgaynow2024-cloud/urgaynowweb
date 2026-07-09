import "server-only";

function str(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

/**
 * Typed, validated view of the environment. Loaded once on the server via
 * lib/db. Missing values fall back gracefully (non-fatal) but are warned about
 * so misconfiguration surfaces early instead of failing obscurely at runtime.
 */
export const env = {
  databaseUrl: str("DATABASE_URL"),
  adminUser: str("ADMIN_USERNAME"),
  adminPass: str("ADMIN_PASSWORD"),
  siteUrl: str("NEXT_PUBLIC_SITE_URL", "https://urgaynow.com"),
  siteName: str("NEXT_PUBLIC_SITE_NAME", "Ur Gay Now"),
  blobStoreId: str("BLOB_STORE_ID"),
  vercelOidc: str("VERCEL_OIDC_TOKEN"),
};

if (!env.databaseUrl) {
  console.warn("[env] DATABASE_URL is not set — database queries will fail at runtime.");
}
if (!env.adminUser || !env.adminPass) {
  console.warn(
    "[env] ADMIN_USERNAME / ADMIN_PASSWORD are not set — admin login will be unavailable.",
  );
}
