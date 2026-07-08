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
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB).` },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PNG, JPG, GIF, WebP, or AVIF." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadFile(file, folder);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Upload failed", {
      user: session.name,
      folder,
      filename: file.name,
      type: file.type,
      size: file.size,
      message,
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    });

    let userMessage = "Upload failed. Please try again.";
    const lower = message.toLowerCase();
    if (lower.includes("token") || lower.includes("auth") || lower.includes("oidc") || lower.includes("store")) {
      userMessage = "Image storage authentication failed. Check Blob store config.";
    } else if (lower.includes("not found") || lower.includes("store not found")) {
      userMessage = "Image storage bucket was not found. Check storage config.";
    } else if (lower.includes("private")) {
      userMessage = "Storage access denied. The uploaded file must be publicly accessible.";
    } else if (lower.includes("path") || lower.includes("filename")) {
      userMessage = "Invalid upload path or filename.";
    } else if (lower.includes("too large") || lower.includes("entity too large") || lower.includes("413")) {
      userMessage = `File too large for server upload (max ${MAX_BYTES / 1024 / 1024}MB).`;
    } else if (lower.includes("unsupported") || lower.includes("content type")) {
      userMessage = "Unsupported file type for storage.";
    }

    return NextResponse.json({ error: userMessage, _debug: message }, { status: 500 });
  }
}
