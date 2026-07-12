import "server-only";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  await getSession();

  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;

  try {
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
      contentType: file.type,
      ...(storeId ? { storeId } : {}),
      ...(oidcToken ? { oidcToken } : {}),
    });

    console.log("[upload] success", {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
    return blob.url;
  } catch (err) {
    console.error("[upload] Blob put failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
      cause: err instanceof Error ? (err as Error & { cause?: unknown }).cause : undefined,
      storeIdPresent: Boolean(storeId),
      oidcTokenPresent: Boolean(oidcToken),
    });
    throw err;
  }
}

export { MAX_BYTES, ALLOWED_TYPES };

