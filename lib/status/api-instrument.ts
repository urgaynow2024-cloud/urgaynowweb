import "server-only";
import { updateMetricBucket, getBucketStart } from "./instrumentation";

export type RouteHandler<T> = (req: Request, ...args: any[]) => Promise<T>;

export function instrumentApiRoute<T extends RouteHandler<any>>(
  handler: T,
  opts: { routePattern: string; excludePaths?: string[] } = { routePattern: "/api/unknown" },
): RouteHandler<T> {
  const { routePattern, excludePaths } = opts;

  return async (req: Request, ...args: any[]): Promise<T> => {
    const url = new URL(req.url);
    if (excludePaths?.some((p) => url.pathname === p || url.pathname.startsWith(p))) {
      return handler(req, ...args);
    }

    const start = Date.now();
    let status = 0;
    let isSuccess = false;
    let isFailure = false;

    try {
      const res = await handler(req, ...args);
      status = res instanceof Response ? res.status : 200;
      isSuccess = status >= 200 && status < 400;
      isFailure = status >= 500;
      return res;
    } catch (err) {
      status = 500;
      isFailure = true;
      throw err;
    } finally {
      const durationMs = Date.now() - start;
      const now = new Date();
      const bucketStart = getBucketStart(1, now);

      Promise.all([
        updateMetricBucket({
          metricKey: `api_request_count:${routePattern}`,
          bucketStart,
          bucketSize: 1,
          value: 1,
          unit: "req",
          source: "api-middleware",
          environment: "production",
          isSuccess,
          isFailure,
        }).catch(() => {}),
        isFailure
          ? updateMetricBucket({
              metricKey: `api_error_count:${routePattern}`,
              bucketStart,
              bucketSize: 1,
              value: 1,
              unit: "err",
              source: "api-middleware",
              environment: "production",
              isSuccess: false,
              isFailure: true,
            }).catch(() => {})
          : Promise.resolve(),
      ]).catch(() => {});
    }
  };
}
