import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
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
 * Upload a file. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is configured,
 * otherwise writes to ./public/uploads (local dev only — not persistent on Vercel).
 * Returns a public URL.
 */
export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  await getSession(); // ensure caller is an admin

  const safeName = slugifyFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(`${folder}/${safeName}`, bytes, {
      access: "public",
      contentType: file.type,
      token,
    });
    return blob.url;
  }

  // Local fallback (development)
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), bytes);
  return `/${folder}/${safeName}`;
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
