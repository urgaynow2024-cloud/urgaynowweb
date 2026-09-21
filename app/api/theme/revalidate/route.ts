import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth";
import { invalidateThemeCache } from "@/lib/theme-resolver";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await requireAdmin();

  invalidateThemeCache();
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings/appearance", "layout");

  return NextResponse.json({ success: true, revalidated: true });
}
