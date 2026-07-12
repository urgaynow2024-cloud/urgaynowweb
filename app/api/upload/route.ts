import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  uploadFile,
  isAllowedImageType,
  MAX_BYTES,
} from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "The file was too large to process. Try a smaller image." },
      { status: 413 },
    );
  }

  const file = form.get("file");
  const folder = (form.get("folder") as string) || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file provided." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, error: "File is empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB).` },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unsupported file type. Use PNG, JPG, GIF, WebP, or AVIF.",
      },
      { status: 400 },
    );
  }

  try {
    const url = await uploadFile(file, folder);
    return NextResponse.json({ success: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";

    console.error("[upload] Route-level failure", {
      user: session.name,
      folder,
      filename: file.name,
      type: file.type,
      size: file.size,
      message,
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    });

    const lower = message.toLowerCase();
    let userMessage = "The image could not be uploaded.";
    if (lower.includes("no blob credentials found") || lower.includes("blob store is not configured")) {
      userMessage =
        "Image storage is not configured. Please contact support.";
    } else if (lower.includes("store not found") || lower.includes("store_suspended")) {
      userMessage = "Image storage bucket was not found. Check storage config.";
    } else if (lower.includes("access denied") || lower.includes("forbidden")) {
      userMessage = "Storage access denied. The uploaded file must be publicly accessible.";
    } else if (lower.includes("content type") && lower.includes("not allowed")) {
      userMessage = "Unsupported file type for storage.";
    } else if (lower.includes("too large") || lower.includes("entity too large") || lower.includes("413")) {
      userMessage = `File too large for server upload (max ${Math.min(MAX_BYTES, 4.5 * 1024 * 1024) / 1024 / 1024}MB).`;
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
      },
      { status: 500 },
    );
  }
}
