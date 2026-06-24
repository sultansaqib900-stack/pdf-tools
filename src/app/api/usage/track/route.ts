import { NextRequest, NextResponse } from "next/server";
import { incrementDailyUsage } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

export async function POST(req: NextRequest) {
  // Rate limit: 100 requests per minute per IP
  const { success, reset } = await rateLimit(req, { limit: 100, window: 60 });
  if (!success) {
    return rateLimitResponse(reset);
  }

  try {
    const body = await req.json();
    const clientId = validateString(body.clientId, 100);
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "Invalid clientId" }, { status: 400 });
    }

    const usage = await incrementDailyUsage(clientId);
    return NextResponse.json({ ok: true, ...usage });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
