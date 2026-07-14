import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];

// Issues short-lived client upload tokens for direct browser -> Blob uploads.
// This bypasses the serverless function 4.5MB request body limit.
export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: 25 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Record creation is handled by /api/gallery/submit.
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[blob] handleUpload failed", err);
    return NextResponse.json(
      { error: "Could not prepare the upload. Please try again." },
      { status: 500 },
    );
  }
}
