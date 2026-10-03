import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Only changelog paths may be revalidated from the admin UI. An allowlist keeps
 * this endpoint from becoming a general "purge any cache on the site" primitive.
 */
const ALLOWED_PATHS = new Set(["/", "/updates", "/updates/[slug]"]);

function isAllowed(path: string): boolean {
  if (ALLOWED_PATHS.has(path)) return true;
  // Any single published changelog entry: /updates/<slug>
  return /^\/updates\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(path);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const path = body?.path;

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  if (!isAllowed(path)) {
    return NextResponse.json(
      { error: `Path "${path}" is not revalidatable. Allowed: ${[...ALLOWED_PATHS].join(", ")}` },
      { status: 400 },
    );
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path });
}