import { NextRequest, NextResponse } from "next/server";
import { resolveRequestEntitlement } from "@/lib/premiumServer";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 60, window: 60, identifier: "premium-verify" });
  if (!success) return rateLimitResponse(reset);

  const entitlement = await resolveRequestEntitlement(
    req,
    req.nextUrl.searchParams.get("clientId"),
  );
  if (!entitlement) {
    return NextResponse.json({ premium: false, error: "Invalid clientId" }, { status: 400 });
  }

  return NextResponse.json(
    { premium: entitlement.premium },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
