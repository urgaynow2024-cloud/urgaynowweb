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

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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

/**
 * Upload a file to Vercel Blob. Requires `BLOB_READ_WRITE_TOKEN` to be set.
 * Returns a public URL. Throws a controlled error when storage is not configured.
 */
export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  await getSession(); // ensure caller is an admin

  if (!isBlobConfigured()) {
    // Controlled, user-safe error. Never leaks credentials or stack traces.
    throw new Error(
      "Image storage is not configured. Please contact support.",
    );
  }

  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const blob = await put(`${folder}/${safeName}`, bytes, {
    access: "public",
    contentType: file.type,
    token: process.env.BLOB_READ_WRITE_TOKEN as string,
  });
  return blob.url;
}

export { MAX_BYTES, ALLOWED_TYPES };
