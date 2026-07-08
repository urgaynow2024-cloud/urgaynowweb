import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile, isAllowedImageType } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folder = (form.get("folder") as string) || "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 400 });
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
    console.error("Upload failed", err);
    const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again.";
    
    // Don't expose internal errors to client
    const userMessage = errorMessage.includes("BLOB_READ_WRITE_TOKEN")
      ? "Storage not configured. Please contact an administrator."
      : "Upload failed. Please try again.";
      
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
