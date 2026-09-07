import { NextResponse } from "next/server";
import crypto from "crypto";
import { setPremiumByEmail, revokePremiumByEmail } from "@/lib/kv";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Events that end an entitlement.
 *
 * `subscription_updated` is deliberately absent: it fires for ordinary changes
 * such as a plan switch or a card update, so it is handled below by inspecting
 * the status rather than by revoking outright.
 */
const REVOKE_EVENTS = new Set([
  "subscription_expired",
  "subscription_cancelled",
  "subscription_payment_failed",
  "order_refunded",
]);

/** Subscription statuses that mean the customer currently has access. */
const ACTIVE_STATUSES = new Set(["active", "on_trial", "paid"]);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const name: string = event.meta?.event_name || "";
    const attrs = event.data?.attributes || {};
    const email: string | undefined = attrs.user_email;
    const status: string | undefined = attrs.status;

    if (!email) {
      // Nothing actionable without an email to key the entitlement on.
      return NextResponse.json({ received: true, ignored: "no email" });
    }

    // --- Grant -------------------------------------------------------------
    if (name === "order_created" && status === "paid") {
      await setPremiumByEmail(email);
      return NextResponse.json({ received: true, action: "granted" });
    }

    if (name === "subscription_created" || name === "subscription_resumed") {
      if (!status || ACTIVE_STATUSES.has(status)) {
        await setPremiumByEmail(email);
        return NextResponse.json({ received: true, action: "granted" });
      }
    }

    // --- Revoke ------------------------------------------------------------
    //
    // Previously this route handled only order_created, so a refunded or
    // cancelled customer kept premium forever. Revocation clears the email
    // entitlement and every device clientId that redeemed it.
    if (REVOKE_EVENTS.has(name)) {
      const { devices } = await revokePremiumByEmail(email);
      return NextResponse.json({ received: true, action: "revoked", devices });
    }

    // A subscription changed. Trust the reported status rather than assuming.
    if (name === "subscription_updated" && status) {
      if (ACTIVE_STATUSES.has(status)) {
        await setPremiumByEmail(email);
        return NextResponse.json({ received: true, action: "granted" });
      }
      const { devices } = await revokePremiumByEmail(email);
      return NextResponse.json({ received: true, action: "revoked", devices });
    }

    return NextResponse.json({ received: true, ignored: name || "unknown" });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
