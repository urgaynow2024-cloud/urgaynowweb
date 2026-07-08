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

const MAX_BYTES = 4 * 1024 * 1024; // 4MB to stay within Vercel serverless request/upload limits

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

function getBlobStoreId(): string | undefined {
  return process.env.BLOB_STORE_ID || undefined;
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

  const storeId = getBlobStoreId();
  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const blob = await put(`${folder}/${safeName}`, bytes, {
      access: "public",
      contentType: file.type,
      ...(storeId ? { storeId } : {}),
    });
    return blob.url;
  } catch (err) {
    console.error("[upload] Vercel Blob upload failed", {
      filename: file.name,
      folder,
      contentType: file.type,
      size: file.size,
      storeIdPresent: Boolean(storeId),
      error: err instanceof Error ? err.message : "unknown error",
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}

export { MAX_BYTES, ALLOWED_TYPES };
