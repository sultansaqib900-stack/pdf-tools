import { NextRequest, NextResponse } from "next/server";
import { kv, setPremiumStatus, setPremiumByEmail, getPremiumStatusByEmail } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail, validateString } from "@/lib/validation";

interface CheckoutNonce {
  clientId: string;
  used?: boolean;
  email?: string;
}

/**
 * Confirms a premium purchase.
 *
 * SECURITY: this endpoint is fail-CLOSED. Premium is only granted when we can
 * positively prove entitlement, which means one of:
 *   1. A valid, unused checkout nonce that was issued to this same clientId
 *      (created by /api/premium/init-checkout), or
 *   2. An email that the LemonSqueezy webhook has already marked as premium.
 *
 * If KV is unreachable we return 503 rather than granting access — previously
 * the catch-all fell through to `setPremiumStatus(clientId, true)`, which let
 * anyone POST themselves a lifetime premium account.
 */
export async function POST(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 20, window: 60 });
  if (!success) return rateLimitResponse(reset);

  let body: { clientId?: string; nonce?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, premium: false, error: "Invalid request" }, { status: 400 });
  }

  const clientId = validateString(body.clientId, 100);
  const nonce = validateString(body.nonce, 200);
  const email = body.email ? validateEmail(body.email) : null;

  if (!clientId) {
    return NextResponse.json({ ok: false, premium: false, error: "No clientId" }, { status: 400 });
  }

  if (!nonce && !email) {
    return NextResponse.json(
      { ok: false, premium: false, error: "A checkout reference or purchase email is required" },
      { status: 400 }
    );
  }

  // --- Path 1: redeem a checkout nonce -------------------------------------
  if (nonce) {
    let record: CheckoutNonce | null;
    try {
      const raw = await kv.get(`pdftools:checkout:${nonce}`);
      record = typeof raw === "string" ? (JSON.parse(raw) as CheckoutNonce) : (raw as CheckoutNonce | null);
    } catch {
      // Fail closed — we cannot verify entitlement without KV.
      return NextResponse.json(
        { ok: false, premium: false, error: "Verification service unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    if (!record) {
      return NextResponse.json({ ok: false, premium: false, error: "Unknown or expired checkout" }, { status: 400 });
    }
    if (record.used) {
      return NextResponse.json({ ok: false, premium: false, error: "This checkout was already redeemed" }, { status: 400 });
    }
    if (record.clientId !== clientId) {
      return NextResponse.json({ ok: false, premium: false, error: "Checkout does not belong to this client" }, { status: 403 });
    }

    // Burn the nonce first so a race cannot redeem it twice.
    await kv.set(`pdftools:checkout:${nonce}`, JSON.stringify({ ...record, used: true }), { ex: 7200 });
    await setPremiumStatus(clientId, true);
    if (email) await setPremiumByEmail(email, clientId);

    return NextResponse.json({ ok: true, premium: true });
  }

  // --- Path 2: link a webhook-confirmed purchase email ----------------------
  let entitled = false;
  try {
    entitled = await getPremiumStatusByEmail(email!);
  } catch {
    return NextResponse.json(
      { ok: false, premium: false, error: "Verification service unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  if (!entitled) {
    return NextResponse.json({
      ok: false,
      premium: false,
      error: "No completed purchase found for this email. If you just paid, wait a minute and retry.",
    });
  }

  await setPremiumStatus(clientId, true);
  return NextResponse.json({ ok: true, premium: true });
}
