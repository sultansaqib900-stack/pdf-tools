import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const evalMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/kv", () => ({ kv: { eval: evalMock } }));

import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

beforeEach(() => evalMock.mockReset());

describe("rateLimit", () => {
  it("uses Vercel's canonical client IP, hashes it, and reserves the TTL atomically", async () => {
    evalMock.mockResolvedValue([3, 60]);
    const request = new NextRequest("https://example.com/api/test", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "198.51.100.25",
      },
    });
    const networkHash = createHash("sha256").update("203.0.113.10").digest("hex").slice(0, 32);

    const result = await rateLimit(request, { limit: 5, window: 60, identifier: "test" });

    expect(result).toEqual(expect.objectContaining({ success: true, remaining: 2 }));
    expect(evalMock).toHaveBeenCalledWith(
      expect.stringContaining("INCR"),
      [`pdftools:rate-limit:test:${networkHash}`],
      ["60"],
    );
    expect(JSON.stringify(evalMock.mock.calls)).not.toContain("198.51.100.25");
  });

  it("fails closed when requested and quota storage is unavailable", async () => {
    evalMock.mockResolvedValue(undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = new NextRequest("https://example.com/api/test");
    const result = await rateLimit(request, {
      limit: 5,
      window: 60,
      identifier: "test",
      failClosed: true,
    });

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    errorSpy.mockRestore();
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 with accurate rate limit headers", () => {
    const reset = Date.now() + 60_000;
    const response = rateLimitResponse(reset, 20);

    expect(response.status).toBe(429);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("20");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("returns a generic JSON error body", async () => {
    const response = rateLimitResponse(Date.now() + 60_000);
    const body = await response.json();
    expect(body.error).toContain("Too many requests");
  });
});
