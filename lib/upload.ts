import "server-only";
import { put } from "@vercel/blob";
import sharp from "sharp";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/avif",
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream", // fallback for .glb
];

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

// Types that sharp can compress losslessly / near-losslessly.
const COMPRESSIBLE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
]);

// Output format per input type. GIFs are passed through (animation).
function outputFormatFor(inputType: string): "jpeg" | "png" | "webp" | "avif" | null {
  switch (inputType) {
    case "image/png": return "webp";
    case "image/jpeg":
    case "image/jpg": return "jpeg";
    case "image/webp": return "webp";
    case "image/avif": return "avif";
    default: return null;
  }
}

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export async function uploadFile(file: File, folder = "uploads"): Promise<string> {
  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;

  const inputType = file.type.toLowerCase();
  const format = outputFormatFor(inputType);

  // Prepare the buffer to upload: compress compressible types, pass others through.
  let uploadBuffer: Buffer | Uint8Array = Buffer.from(await file.arrayBuffer());
  let contentType = inputType;
  let fileName = `${folder}/${Date.now()}-${file.name}`;

  if (format && COMPRESSIBLE_TYPES.has(inputType)) {
    try {
      const compressed = await sharp(uploadBuffer)
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .toFormat(format, { quality: 82, effort: 6 })
        .toBuffer();
      uploadBuffer = compressed;
      contentType = `image/${format}`;
      // Rename extension to match output format where sensible.
      const base = file.name.replace(/\.[^/.]+$/, "");
      fileName = `${folder}/${Date.now()}-${base}.${format}`;
      console.log("[upload] compressed", {
        originalBytes: (Buffer.from(await file.arrayBuffer())).length,
        compressedBytes: compressed.length,
        inputType,
        outputFormat: format,
      });
    } catch (err) {
      console.error("[upload] compression failed, passing through original", {
        message: err instanceof Error ? err.message : String(err),
        inputType,
      });
      // Fall back to the original buffer.
      uploadBuffer = Buffer.from(await file.arrayBuffer());
      contentType = inputType;
    }
  } else if (inputType === "image/gif") {
    // GIFs: pass through unchanged to preserve animation.
    contentType = "image/gif";
  }

  try {
    const blob = await put(fileName, uploadBuffer as Buffer, {
      access: "public",
      contentType,
      ...(storeId ? { storeId } : {}),
      ...(oidcToken ? { oidcToken } : {}),
    });

    console.log("[upload] success", {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });
    return blob.url;
  } catch (err) {
    console.error("[upload] Blob put failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
      cause: err instanceof Error ? (err as Error & { cause?: unknown }).cause : undefined,
      storeIdPresent: Boolean(storeId),
      oidcTokenPresent: Boolean(oidcToken),
    });
    throw err;
  }
}

export { MAX_BYTES, ALLOWED_TYPES };
