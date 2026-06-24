import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

interface RateLimitOptions {
  limit: number;
  window: number; // in seconds
  identifier?: string;
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const { limit, window, identifier } = options;
  
  // Use IP address or custom identifier
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
             req.headers.get("x-real-ip") || 
             "anonymous";
  const key = `rate-limit:${identifier || ip}`;
  
  try {
    const now = Date.now();
    const windowStart = now - (window * 1000);
    
    // Get current requests
    const data = await kv.get<{ count: number; reset: number }>(key);
    
    if (!data || data.reset < windowStart) {
      // Reset window
      await kv.set(key, { count: 1, reset: now + (window * 1000) }, { px: window * 1000 });
      return { success: true, limit, remaining: limit - 1, reset: now + (window * 1000) };
    }
    
    if (data.count >= limit) {
      return { success: false, limit, remaining: 0, reset: data.reset };
    }
    
    // Increment count
    await kv.set(key, { count: data.count + 1, reset: data.reset }, { px: window * 1000 });
    return { success: true, limit, remaining: limit - data.count - 1, reset: data.reset };
  } catch (error) {
    // If KV fails, allow request (fail open)
    console.error("Rate limit error:", error);
    return { success: true, limit, remaining: limit - 1, reset: Date.now() + (window * 1000) };
  }
}

export function rateLimitResponse(reset: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { 
      status: 429,
      headers: {
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
