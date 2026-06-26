import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimitResponse } from "@/lib/rate-limit";

describe("rateLimitResponse", () => {
  it("returns 429 with rate limit headers", () => {
    const reset = Date.now() + 60000;
    const res = rateLimitResponse(reset);

    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns a JSON error body", async () => {
    const res = rateLimitResponse(Date.now() + 60000);
    const body = await res.json();
    expect(body.error).toContain("Too many requests");
  });
});
