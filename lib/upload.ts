import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import path from "path";
import { getSession } from "@/lib/auth";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
];

const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

function slugifyFilename(name: string): string {
  const ext = path.extname(name) || "";
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "file"}-${randomUUID().slice(0, 8)}${ext}`;
}

export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  await getSession();

  const storeId = process.env.BLOB_STORE_ID || undefined;
  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const debugInfo = {
    filename: file.name,
    folder,
    contentType: file.type,
    size: file.size,
    storeIdConfigured: Boolean(storeId),
    vercelEnv: process.env.VERCEL_ENV || "local",
    hasOidcToken: Boolean(process.env.VERCEL_OIDC_TOKEN),
  };

  try {
    const blob = await put(`${folder}/${safeName}`, bytes, {
      access: "public",
      contentType: file.type,
      ...(storeId ? { storeId } : {}),
    });

    console.log("[upload] success", { ...debugInfo, url: blob.url, pathname: blob.pathname });
    return blob.url;
  } catch (err) {
    const raw = err instanceof Error ? err : new Error(String(err));
    console.error("[upload] Vercel Blob put failed", {
      ...debugInfo,
      message: raw.message,
      stack: raw.stack,
      name: raw.name,
      cause: raw.cause,
    });

    if (raw.message.includes("No blob credentials found")) {
      throw new Error(
        "Image storage authentication failed. Blob store credentials were not found. This usually means the Vercel Blob integration is not attached to this deployment environment."
      );
    }
    throw raw;
  }
}

export { MAX_BYTES, ALLOWED_TYPES };
