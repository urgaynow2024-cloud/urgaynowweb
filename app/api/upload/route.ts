import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  uploadFile,
  isAllowedImageType,
  MAX_BYTES,
} from "@/lib/upload";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    const session = await getSession();
    if (!session) {
      status = 401;
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status },
      );
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      status = 413;
      return NextResponse.json(
        { success: false, error: "The file was too large to process. Try a smaller image." },
        { status },
      );
    }

    const file = form.get("file");
    const folder = (form.get("folder") as string) || "uploads";

    if (!(file instanceof File)) {
      status = 400;
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status },
      );
    }

    if (file.size === 0) {
      status = 400;
      return NextResponse.json(
        { success: false, error: "File is empty." },
        { status },
      );
    }

    if (file.size > MAX_BYTES) {
      status = 400;
      return NextResponse.json(
        { success: false, error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB).` },
        { status },
      );
    }

    if (!isAllowedImageType(file.type)) {
      status = 400;
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Use PNG, JPG, GIF, WebP, or AVIF.",
        },
        { status },
      );
    }

    try {
      const url = await uploadFile(file, folder);
      status = 200;
      isSuccess = true;
      isFailure = false;
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
        userMessage = "Image storage is not configured. Please contact support.";
      } else if (lower.includes("store not found") || lower.includes("store_suspended")) {
        userMessage = "Image storage bucket was not found. Check storage config.";
      } else if (lower.includes("access denied") || lower.includes("forbidden")) {
        userMessage = "Storage access denied. The uploaded file must be publicly accessible.";
      } else if (lower.includes("content type") && lower.includes("not allowed")) {
        userMessage = "Unsupported file type for storage.";
      } else if (lower.includes("too large") || lower.includes("entity too large") || lower.includes("413")) {
        userMessage = `File too large for server upload (max ${Math.min(MAX_BYTES, 4.5 * 1024 * 1024) / 1024 / 1024}MB).`;
      }

      status = 500;
      return NextResponse.json(
        { success: false, error: userMessage },
        { status },
      );
    }
  } finally {
    const durationMs = Date.now() - start;
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/upload",
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
        metricKey: "api_error_count:/api/upload",
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
