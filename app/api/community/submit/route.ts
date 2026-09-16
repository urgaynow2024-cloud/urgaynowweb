import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

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

// Only accept URLs that came from our Vercel Blob store.
function isBlobUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  const storeId = process.env.BLOB_STORE_ID;
  if (storeId && url.includes(storeId)) return true;
  return url.includes("vercel-storage.com");
}

const VALID_TYPES = new Set([
  "ARTWORK",
  "AVATAR",
  "SCREENSHOT",
  "PHOTOGRAPHY",
  "VRCHAT_WORLD",
  "CREATOR_PROJECT",
  "OTHER",
]);

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

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Honeypot: bots that fill this hidden field get a fake success.
  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ success: true });
  }

  const imageUrl = String(payload.imageUrl || "").trim();
  const rawTitle = String(payload.title || "").trim();
  const description = String(payload.description || "").trim();
  const submitterName = String(payload.submitterName || "").trim();
  const submitterEmail = String(payload.submitterEmail || "").trim();
  const rawType = String(payload.type || "").toUpperCase();
  const fileName = String(payload.fileName || "").trim();
  const fileSize = Number(payload.fileSize);
  const contentType = String(payload.contentType || "").trim();

  if (!isBlobUrl(imageUrl)) {
    return NextResponse.json(
      { success: false, error: "Please upload your file first." },
      { status: 400 },
    );
  }

  if (!VALID_TYPES.has(rawType)) {
    return NextResponse.json(
      { success: false, error: "Please choose a valid submission type." },
      { status: 400 },
    );
  }

  if (!fileName) {
    return NextResponse.json(
      { success: false, error: "Missing file name." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json(
      { success: false, error: "Missing file size." },
      { status: 400 },
    );
  }

  if (!contentType) {
    return NextResponse.json(
      { success: false, error: "Missing content type." },
      { status: 400 },
    );
  }

  let title = rawTitle;
  if (!title) {
    const seg = fileName.split("/").pop() || "";
    title = decodeURIComponent(seg).replace(/\.[^.]+$/, "") || "Untitled submission";
  }

  try {
    await prisma.communitySubmission.create({
      data: {
        title,
        description,
        imageUrl,
        submitterName,
        submitterEmail: submitterEmail || undefined,
        type: rawType as any,
        fileName,
        fileSize,
        contentType,
        status: "PENDING",
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[community/submit] failure", { ip, message });
    return NextResponse.json(
      {
        success: false,
        error: "Your submission could not be saved. Please try again.",
      },
      { status: 500 },
    );
  }
}