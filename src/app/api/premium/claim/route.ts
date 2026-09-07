import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { kv, keys, setPremiumStatus } from "@/lib/kv";
import { validateEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 10,
    window: 300,
    scope: "premium:claim",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  try {
    const { email, clientId } = await req.json();
    if (!email || !clientId) {
      return NextResponse.json({ ok: false, error: "email and clientId required" }, { status: 400 });
    }

    const validEmail = validateEmail(email);
    if (!validEmail) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    try {
      const existing = await kv.get(keys.premiumByEmail(validEmail));
      if (existing === true) {
        await setPremiumStatus(clientId, true);
        return NextResponse.json({ ok: true, premium: true });
      }
    } catch {
      // KV unavailable
    }

    return NextResponse.json({ ok: false, premium: false, error: "No premium found for this email" });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to claim premium" }, { status: 500 });
  }
}
