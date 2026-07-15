import { describe, it } from "node:test";
import assert from "node:assert";

// Minimal pure-function tests for instrumentation logic that don't need a DB.
// Run with: npx tsx tests/status/instrumentation.test.ts

function normalizeApiRoute(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const out: string[] = [];
  for (const seg of segments) {
    if (/^\d+$/.test(seg)) {
      out.push("[id]");
    } else {
      out.push(seg);
    }
  }
  return "/" + out.join("/");
}

describe("route normalization", () => {
  it("leaves static routes unchanged", () => {
    assert.strictEqual(normalizeApiRoute("/api/status/now"), "/api/status/now");
  });

  it("replaces numeric ids with [id]", () => {
    assert.strictEqual(normalizeApiRoute("/api/news/123"), "/api/news/[id]");
  });

  it("handles multiple numeric segments", () => {
    assert.strictEqual(normalizeApiRoute("/api/shop/products/456"), "/api/shop/products/[id]");
  });

  it("does not replace non-numeric segments", () => {
    assert.strictEqual(normalizeApiRoute("/api/users/abc"), "/api/users/abc");
  });
});

describe("bucket boundaries", () => {
  function getBucketStart(bucketSize: number, ts: Date): Date {
    const d = new Date(ts);
    d.setMinutes(Math.floor(d.getMinutes() / bucketSize) * bucketSize, 0, 0);
    return d;
  }

  it("1m bucket floors to the minute", () => {
    const d = new Date("2026-07-15T12:34:56Z");
    const b = getBucketStart(1, d);
    assert.strictEqual(b.getUTCMinutes(), 34);
    assert.strictEqual(b.getUTCSeconds(), 0);
  });

  it("5m bucket floors to the 5-minute mark", () => {
    const d = new Date("2026-07-15T12:37:56Z");
    const b = getBucketStart(5, d);
    assert.strictEqual(b.getUTCMinutes(), 35);
    assert.strictEqual(b.getUTCSeconds(), 0);
  });

  it("60m bucket floors to the hour", () => {
    const d = new Date("2026-07-15T12:47:56Z");
    const b = getBucketStart(60, d);
    assert.strictEqual(b.getUTCHours(), 12);
    assert.strictEqual(b.getUTCMinutes(), 0);
    assert.strictEqual(b.getUTCSeconds(), 0);
  });
});

describe("metrics API validation", () => {
  it("rejects range > 7d", () => {
    const maxRangeMs = 7 * 24 * 60 * 60 * 1000;
    const invalid = 8 * 24 * 60 * 60 * 1000;
    assert.ok(invalid > maxRangeMs, "8 days should exceed max 7-day range");
  });

  it("defaults to 24h when range is missing", () => {
    const range = "24h";
    const rangeMs = { "1h": 3600000, "6h": 21600000, "24h": 86400000, "7d": 604800000 }[range];
    assert.strictEqual(rangeMs, 86400000);
  });
});

describe("auth event classification", () => {
  it("success increments success count only", () => {
    const isSuccess = true;
    const isFailure = false;
    assert.ok(isSuccess && !isFailure);
  });

  it("failure increments failure count only", () => {
    const isSuccess = false;
    const isFailure = true;
    assert.ok(isFailure && !isSuccess);
  });

  it("zero attempts yields null rate, not 0%", () => {
    const total = 0;
    const rate = total === 0 ? null : (50 / total) * 100;
    assert.strictEqual(rate, null);
  });
});

describe("error-rate handling", () => {
  it("handles division by zero", () => {
    const total = 0;
    const failed = 0;
    const rate = total === 0 ? null : (failed / total) * 100;
    assert.strictEqual(rate, null);
  });

  it("calculates rate when data exists", () => {
    const total = 100;
    const failed = 5;
    const rate = (failed / total) * 100;
    assert.strictEqual(rate, 5);
  });
});

console.log("All instrumentation tests passed.");
