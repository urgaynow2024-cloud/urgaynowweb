import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  uploadFile,
  isAllowedImageType,
  isBlobConfigured,
  MAX_BYTES,
} from "@/lib/upload";

export const runtime = "nodejs";

/**
 * POST /api/upload
 *
 * Authenticated image upload to Vercel Blob.
 *
 * Graceful failure contract:
 * - Missing/invalid auth  -> 401
 * - Missing/invalid file   -> 400 (with specific, safe message)
 * - Storage not configured -> 503 "Image storage is not configured. Please contact support."
 * - Any other failure      -> 500 "Upload failed. Please try again."
 *
 * Stack traces are never returned to the client; details are logged server-side only.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = (form.get("folder") as string) || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 8MB)." },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PNG, JPG, GIF, WebP, or AVIF." },
      { status: 400 },
    );
  }

  // Fail fast and cleanly before attempting storage.
  if (!isBlobConfigured()) {
    console.error(
      "Upload rejected: BLOB_READ_WRITE_TOKEN is not set. Configure Vercel Blob storage.",
    );
    return NextResponse.json(
      { error: "Image storage is not configured. Please contact support." },
      { status: 503 },
    );
  }

  try {
    const url = await uploadFile(file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    // Keep useful server logs, but never leak internals to the client.
    console.error("Upload failed", {
      user: session.name,
      folder,
      filename: file.name,
      type: file.type,
      size: file.size,
      message: err instanceof Error ? err.message : "unknown error",
    });

    const message =
      err instanceof Error &&
      (err.message.includes("not configured") ||
        err.message.includes("BLOB_READ_WRITE_TOKEN") ||
        err.message.includes("environment variable"))
        ? "Image storage is not configured. Please contact support."
        : "Upload failed. Please try again.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
