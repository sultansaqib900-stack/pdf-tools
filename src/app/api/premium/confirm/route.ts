import { NextRequest, NextResponse } from "next/server";
import {
  bindPremiumClient,
  getCheckoutRecord,
  getPremiumStatus,
  setCheckoutRecord,
} from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 20, window: 60, identifier: "premium-confirm" });
  if (!success) return rateLimitResponse(reset);

  try {
    const body = await req.json();
    const clientId = validateString(body.clientId, 100);
    const nonce = validateString(body.nonce, 128);
    if (!clientId || !nonce) {
      return NextResponse.json({ ok: false, premium: false, error: "Invalid checkout confirmation." }, { status: 400 });
    }

    const checkout = await getCheckoutRecord(nonce);
    if (!checkout || checkout.clientId !== clientId) {
      return NextResponse.json({ ok: false, premium: false, error: "Checkout session not found." }, { status: 404 });
    }

    if (checkout.used) {
      const premium = await getPremiumStatus(clientId);
      return NextResponse.json({ ok: premium, premium });
    }

    if (!checkout.paid || !checkout.email) {
      return NextResponse.json(
        { ok: false, premium: false, pending: true, error: "Waiting for verified payment confirmation." },
        { status: 409 },
      );
    }

    const bound = await bindPremiumClient(clientId, checkout.email);
    if (!bound) {
      return NextResponse.json({ ok: false, premium: false, error: "The paid entitlement is not active." }, { status: 403 });
    }

    await setCheckoutRecord(nonce, { ...checkout, used: true }, 24 * 60 * 60);
    return NextResponse.json({ ok: true, premium: true });
  } catch {
    return NextResponse.json({ ok: false, premium: false, error: "Confirmation failed." }, { status: 500 });
  }
}
