import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import path from "path";
import { getSession } from "@/lib/auth";

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
 * Upload a file. Requires Vercel Blob (BLOB_READ_WRITE_TOKEN must be set).
 * Returns a public URL.
 */
export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  await getSession(); // ensure caller is an admin

  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set. Please configure Vercel Blob storage.");
  }

  const blob = await put(`${folder}/${safeName}`, bytes, {
    access: "public",
    contentType: file.type,
    token,
  });
  return blob.url;
}

export function isAllowedImageType(type: string): boolean {
  return [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/avif",
  ].includes(type);
}
