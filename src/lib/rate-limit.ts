import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

interface RateLimitOptions {
  limit: number;
  window: number; // seconds
  identifier?: string; // endpoint namespace
  failClosed?: boolean;
}

function requestIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")?.trim()
    || "anonymous";
}

const INCREMENT_WITH_TTL_SCRIPT = `
  local count = redis.call("INCR", KEYS[1])
  if count == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end
  return { count, redis.call("TTL", KEYS[1]) }
`;

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const { limit, window, identifier = "general", failClosed = false } = options;
  const key = `pdftools:rate-limit:${identifier}:${requestIp(req)}`;
  const fallbackReset = Date.now() + window * 1000;

  try {
    // Incrementing and assigning the first TTL must be atomic. If EXPIRE were
    // a separate request, a transient failure could leave a permanent counter.
    const [count, ttl] = await kv.eval<[string], [number, number]>(
      INCREMENT_WITH_TTL_SCRIPT,
      [key],
      [String(window)],
    );
    const reset = Date.now() + (ttl > 0 ? ttl : window) * 1000;
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return {
      success: !failClosed,
      limit,
      remaining: failClosed ? 0 : Math.max(0, limit - 1),
      reset: fallbackReset,
    };
  }
}

export function rateLimitResponse(reset: number, limit = 10) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After": Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString(),
      },
    },
  );
}
