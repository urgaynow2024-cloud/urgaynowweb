import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  uploadFile,
  isAllowedImageType,
  MAX_BYTES,
} from "@/lib/upload";

export const runtime = "nodejs";

const SUBMISSION_FOLDER = "gallery-submissions";

// Lightweight in-memory rate limit: max 6 submissions per IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_PER_WINDOW) return true;
  entry.count += 1;
  return false;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many submissions. Please try again later.",
      },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "The file was too large to process." },
      { status: 413 },
    );
  }

  // Honeypot: bots that fill this hidden field get a fake success.
  if ((form.get("website") as string)?.trim()) {
    return NextResponse.json({ success: true });
  }

  const file = form.get("file");
  const rawTitle = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const submitterName = String(form.get("submitterName") || "").trim();

  // Title is optional; fall back to the filename (without extension) or a default.
  let title = rawTitle;
  if (!title && file instanceof File) {
    title = file.name.replace(/\.[^.]+$/, "") || "Untitled submission";
  }
  if (!title) title = "Untitled submission";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Please choose an image to upload." },
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
      {
        success: false,
        error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB).`,
      },
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
    const url = await uploadFile(file, SUBMISSION_FOLDER);
    await prisma.galleryImage.create({
      data: {
        title,
        description,
        imageUrl: url,
        submitterName,
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[gallery/submit] failure", {
      ip,
      filename: file.name,
      type: file.type,
      size: file.size,
      message,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Your photo could not be uploaded. Please try again.",
      },
      { status: 500 },
    );
  }
}
