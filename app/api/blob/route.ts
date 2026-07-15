import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export const runtime = "nodejs";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      status = 400;
      return NextResponse.json({ error: "Invalid request." }, { status });
    }

    const pathname = String(body.pathname || "").trim();
    if (!pathname.startsWith("gallery-submissions/") || pathname.includes("..")) {
      status = 400;
      return NextResponse.json({ error: "Invalid path." }, { status });
    }

    try {
      const signed = await issueSignedToken({
        storeId: process.env.BLOB_STORE_ID,
        oidcToken: process.env.VERCEL_OIDC_TOKEN,
        pathname,
        operations: ["put"],
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: MAX_BYTES,
      });

      const { presignedUrl } = await presignUrl(signed, {
        operation: "put",
        pathname,
        access: "public",
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: MAX_BYTES,
      });

      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json({ url: presignedUrl });
    } catch (err) {
      console.error("[blob] presign failed", err);
      status = 500;
      return NextResponse.json(
        { error: "Could not prepare the upload. Please try again." },
        { status },
      );
    }
  } finally {
    const durationMs = Date.now() - start;
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/blob",
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
        metricKey: "api_error_count:/api/blob",
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
