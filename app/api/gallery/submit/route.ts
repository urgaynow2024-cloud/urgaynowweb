import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

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

export async function POST(req: Request) {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      status = 429;
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status },
      );
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      status = 400;
      return NextResponse.json(
        { success: false, error: "Invalid request." },
        { status },
      );
    }

    if (typeof payload.website === "string" && payload.website.trim()) {
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ success: true });
    }

    const imageUrl = String(payload.imageUrl || "").trim();
    const rawTitle = String(payload.title || "").trim();
    const description = String(payload.description || "").trim();
    const submitterName = String(payload.submitterName || "").trim();

    if (!isBlobUrl(imageUrl)) {
      status = 400;
      return NextResponse.json(
        { success: false, error: "Please upload an image first." },
        { status },
      );
    }

    let title = rawTitle;
    if (!title) {
      const seg = imageUrl.split("/").pop() || "";
      title = decodeURIComponent(seg).replace(/\.[^.]+$/, "") || "Untitled submission";
    }

    try {
      await prisma.galleryImage.create({
        data: {
          title,
          description,
          imageUrl,
          submitterName,
          status: "PENDING",
        },
      });
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.error("[gallery/submit] failure", { ip, message });
      status = 500;
      return NextResponse.json(
        { success: false, error: "Your photo could not be submitted. Please try again." },
        { status },
      );
    }
  } finally {
    const durationMs = Date.now() - start;
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/gallery/submit",
      bucketStart,
      bucketSize: 1,
      value: 1,
      unit: "req",
      source: "api-middleware",
      environment: "production",
      isSuccess,
      isFailure,
    }).catch(() => {});
    if (isFailure) {
      updateMetricBucket({
        metricKey: "api_error_count:/api/gallery/submit",
        bucketStart,
        bucketSize: 1,
        value: 1,
        unit: "err",
        source: "api-middleware",
        environment: "production",
        isSuccess: false,
        isFailure: true,
      }).catch(() => {});
    }
  }
}
