import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPremiumStatus, getPremiumStatusByEmail } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 60,
    window: 60,
    scope: "premium:verify",
    failClosed: false,
  });
  if (!success) return rateLimitResponse(reset, limit);

  const clientId = req.nextUrl.searchParams.get("clientId");
  const email = req.nextUrl.searchParams.get("email");

  if (email) {
    const emailPremium = await getPremiumStatusByEmail(email);
    if (emailPremium) return NextResponse.json({ premium: true });
  }

  if (!clientId) {
    return NextResponse.json({ premium: false });
  }

  const premium = await getPremiumStatus(clientId);
  return NextResponse.json({ premium });
}
