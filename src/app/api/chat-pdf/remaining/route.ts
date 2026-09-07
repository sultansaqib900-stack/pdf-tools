import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getChatUsage } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 120,
    window: 60,
    scope: "chat:remaining",
    failClosed: false,
  });
  if (!success) return rateLimitResponse(reset, limit);

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ remaining: 0 });
  const usage = await getChatUsage(clientId);
  return NextResponse.json({ remaining: usage.remaining });
}
