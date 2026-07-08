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

  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const blob = await put(`${folder}/${safeName}`, bytes, {
      access: "public",
      contentType: file.type,
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
    });
    throw err;
  }
}

export { MAX_BYTES, ALLOWED_TYPES };
