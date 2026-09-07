import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { trackChatUsage } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 60,
    window: 60,
    scope: "chat:track",
    failClosed: false,
  });
  if (!success) return rateLimitResponse(reset, limit);

  try {
    const { clientId } = await req.json();
    if (!clientId) return NextResponse.json({ ok: false, remaining: 0 });

    const result = await trackChatUsage(clientId);
    return NextResponse.json({ ok: result.ok, remaining: result.remaining });
  } catch {
    return NextResponse.json({ ok: true, remaining: 3 });
  }
}
