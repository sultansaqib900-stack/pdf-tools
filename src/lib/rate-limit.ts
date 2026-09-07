import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

interface RateLimitOptions {
  limit: number;
  window: number; // in seconds
  identifier?: string;
  /**
   * Namespace for the counter, so different routes don't share a bucket.
   * e.g. "ai" keeps Gemini spend separate from generic usage tracking.
   */
  scope?: string;
  /**
   * When true, deny the request if the KV backend is unavailable instead of
   * allowing it through. Use for expensive/abusable endpoints (paid AI APIs,
   * auth) where an outage should not become an open door.
   */
  failClosed?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  degraded?: boolean;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { limit, window, identifier, scope, failClosed = false } = options;

  const ip = getClientIp(req);
  const key = `rate-limit:${scope ? `${scope}:` : ""}${identifier || ip}`;

  try {
    const now = Date.now();

    // Atomic counter: INCR then set the TTL on first write. This avoids the
    // get-then-set race in the previous implementation, where concurrent
    // requests all read the same count and each wrote count+1.
    const count = await kv.incr(key);
    if (count === 1) {
      await kv.expire(key, window);
    }

    let ttl = await kv.ttl(key);
    // -1 = key exists with no TTL, -2 = key missing. Repair either case.
    if (ttl < 0) {
      await kv.expire(key, window);
      ttl = window;
    }
    const reset = now + ttl * 1000;

    if (count > limit) {
      return { success: false, limit, remaining: 0, reset };
    }
    return { success: true, limit, remaining: Math.max(0, limit - count), reset };
  } catch (error) {
    console.error("Rate limit backend error:", error);
    const reset = Date.now() + window * 1000;
    if (failClosed) {
      return { success: false, limit, remaining: 0, reset, degraded: true };
    }
    return { success: true, limit, remaining: limit - 1, reset, degraded: true };
  }
}

export function rateLimitResponse(reset: number, limit?: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit ?? ""),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After": String(retryAfter),
      },
    }
  );
}
