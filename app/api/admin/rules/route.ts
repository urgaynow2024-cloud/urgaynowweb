import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateMetricBucket, getBucketStart } from "@/lib/status/instrumentation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let status = 500;
  let isSuccess = false;
  let isFailure = true;

  try {
    const session = await getSession();
    if (!session) {
      status = 401;
      return NextResponse.json({ error: "Unauthorized" }, { status });
    }

    try {
      const rules = await prisma.rule.findMany({
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: {
          id: true,
          category: true,
          title: true,
          content: true,
          sortOrder: true,
        },
      });
      status = 200;
      isSuccess = true;
      isFailure = false;
      return NextResponse.json(rules);
    } catch (err) {
      console.error("Failed to load rules", err);
      status = 500;
      return NextResponse.json(
        { error: "Failed to load rules." },
        { status },
      );
    }
  } finally {
    const bucketStart = getBucketStart(1, new Date());
    updateMetricBucket({
      metricKey: "api_request_count:/api/admin/rules",
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
        metricKey: "api_error_count:/api/admin/rules",
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
