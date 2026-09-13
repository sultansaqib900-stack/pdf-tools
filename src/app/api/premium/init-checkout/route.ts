import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { setCheckoutRecord } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";
import { getAuthenticatedSession } from "@/lib/auth/request";

export async function POST(req: NextRequest) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: "Payments are temporarily unavailable." }, { status: 503 });
  }
  const { success, reset } = await rateLimit(req, { limit: 10, window: 60, identifier: "premium-checkout" });
  if (!success) return rateLimitResponse(reset);

  try {
    const body = await req.json();
    const clientId = validateString(body.clientId, 100);
    const plan = body.plan === "monthly" || body.plan === "yearly" ? body.plan : null;
    if (!clientId || !plan) {
      return NextResponse.json({ ok: false, error: "A valid clientId and plan are required." }, { status: 400 });
    }

    const session = await getAuthenticatedSession(req);
    const nonce = crypto.randomBytes(24).toString("hex");
    await setCheckoutRecord(nonce, {
      clientId,
      plan,
      paid: false,
      used: false,
      ...(session ? { accountUserId: session.userId, accountEmail: session.email } : {}),
    });

    return NextResponse.json({ ok: true, nonce, email: session?.email });
  } catch {
    // Checkout must fail closed if a pending record cannot be persisted.
    return NextResponse.json({ ok: false, error: "Checkout could not be initialized. Please try again." }, { status: 503 });
  }
}
