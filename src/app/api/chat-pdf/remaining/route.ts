import { NextRequest, NextResponse } from "next/server";
import { getChatUsage } from "@/lib/kv";
import { resolveRequestEntitlement } from "@/lib/premiumServer";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const requestLimit = await rateLimit(req, { limit: 60, window: 60, identifier: "chat-remaining" });
  if (!requestLimit.success) return rateLimitResponse(requestLimit.reset);

  const entitlement = await resolveRequestEntitlement(
    req,
    req.nextUrl.searchParams.get("clientId"),
  );
  if (!entitlement) {
    return NextResponse.json({ remaining: 0, premium: false, error: "Invalid clientId" }, { status: 400 });
  }
  if (entitlement.premium) {
    return NextResponse.json({ remaining: 999, premium: true });
  }
  const usageIdentity = entitlement.userId
    ? `user:${entitlement.userId}`
    : `client:${entitlement.clientId}`;
  const usage = await getChatUsage(usageIdentity);
  // When the counter store is unreachable, `remaining` is unknown — report
  // null so the client keeps chat enabled instead of faking "0 left".
  return NextResponse.json({ remaining: usage.unknown ? null : usage.remaining, premium: false });
}
