import { NextResponse } from "next/server";
import { issueSignedToken, presignUrl } from "@vercel/blob";

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
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const pathname = String(body.pathname || "").trim();
  if (!pathname.startsWith("gallery-submissions/") || pathname.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
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

    return NextResponse.json({ url: presignedUrl });
  } catch (err) {
    console.error("[blob] presign failed", err);
    return NextResponse.json(
      { error: "Could not prepare the upload. Please try again." },
      { status: 500 },
    );
  }
}
