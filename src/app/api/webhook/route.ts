import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  abandonPremiumWebhook,
  acquirePremiumCustomerLock,
  beginPremiumWebhook,
  bindPremiumUser,
  completePremiumWebhook,
  getCheckoutRecord,
  getPremiumSubscriptionBinding,
  releasePremiumCustomerLock,
  revokePremiumByEmail,
  setCheckoutRecord,
  setPremiumByEmail,
  setPremiumSubscriptionBinding,
} from "@/lib/kv";
import { isConfiguredVariant, LS_CONFIG } from "@/lib/lemonsqueezy";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = Buffer.from(
    crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex"),
    "utf8",
  );
  const actual = Buffer.from(signature, "utf8");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function entitlementExpiry(attributes: Record<string, unknown>, variantId: string): string {
  const supplied = attributes.ends_at || attributes.renews_at;
  if (typeof supplied === "string" && Number.isFinite(Date.parse(supplied))) {
    // A small grace window avoids a renewal-webhook race at the billing boundary.
    return new Date(Date.parse(supplied) + 3 * 24 * 60 * 60 * 1000).toISOString();
  }
  const days = variantId === LS_CONFIG.variants.premiumYearly ? 370 : 35;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: Request) {
  let lockedEventHash: string | null = null;
  let lockedCustomerHash: string | null = null;
  let lockOwnerToken: string | null = null;
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      meta?: { event_name?: string; custom_data?: Record<string, unknown>; test_mode?: boolean };
      data?: { id?: string | number; attributes?: Record<string, unknown> };
    };
    const eventName = event.meta?.event_name || "";
    const attributes = event.data?.attributes || {};
    const customData = event.meta?.custom_data || {};
    const testMode = event.meta?.test_mode === true || attributes.test_mode === true;
    if (testMode && process.env.LEMONSQUEEZY_ALLOW_TEST_MODE !== "true") {
      return NextResponse.json({ received: true, ignored: "test-mode" });
    }
    const clientId = typeof customData.client_id === "string" ? customData.client_id : undefined;
    const nonce = typeof customData.checkout_nonce === "string" ? customData.checkout_nonce : undefined;
    const dataId = String(event.data?.id || "");
    const orderId = String(
      attributes.order_id
      || (eventName.startsWith("order_") ? dataId || attributes.identifier || "" : ""),
    );
    const subscriptionId = String(
      attributes.subscription_id
      || (eventName.startsWith("subscription_") ? dataId : ""),
    );
    const subscriptionBinding = subscriptionId
      ? await getPremiumSubscriptionBinding(subscriptionId)
      : null;
    const attributeEmail = typeof attributes.user_email === "string"
      ? attributes.user_email.trim().toLowerCase()
      : "";
    // Once a subscription is known, keep its original entitlement owner as
    // the canonical identity. Billing-email edits must not transfer account
    // ownership, but lifecycle events still need to renew or revoke access.
    const email = subscriptionBinding?.email || attributeEmail;
    const attributeVariantId = String(
      attributes.variant_id
      || (attributes.first_order_item as Record<string, unknown> | undefined)?.variant_id
      || "",
    );
    const movedOffPremium = eventName === "subscription_updated"
      && Boolean(subscriptionBinding)
      && Boolean(attributeVariantId)
      && !isConfiguredVariant(attributeVariantId);
    // Use the previous configured variant when handling a downgrade so the
    // known Premium entitlement can be revoked instead of ignoring the event.
    const variantId = movedOffPremium
      ? subscriptionBinding?.variantId || ""
      : attributeVariantId || subscriptionBinding?.variantId || "";
    const rawEventTimestamp = attributes.updated_at || attributes.created_at;
    const eventTimestamp = typeof rawEventTimestamp === "string" && Number.isFinite(Date.parse(rawEventTimestamp))
      ? rawEventTimestamp
      : new Date().toISOString();

    if (!email || (!isConfiguredVariant(variantId) && !movedOffPremium)) {
      // Once a mapped subscription has moved away from Premium, invoice-only
      // events for that new product must be acknowledged without reactivation.
      if (
        email
        && subscriptionBinding
        && !isConfiguredVariant(subscriptionBinding.variantId)
        && (!attributeVariantId || !isConfiguredVariant(attributeVariantId))
      ) {
        return NextResponse.json({ received: true, ignored: "non-premium-subscription" });
      }
      return NextResponse.json({ error: "Unrecognized product or customer" }, { status: 400 });
    }

    // The exact signed event can be applied only once. This prevents an old
    // paid event from being replayed after a later refund or expiration.
    const eventHash = crypto.createHash("sha256").update(rawBody).digest("hex");
    const ownerToken = crypto.randomBytes(24).toString("hex");
    const lock = await beginPremiumWebhook(eventHash, ownerToken);
    if (lock === "processed") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (lock === "busy") {
      return NextResponse.json({ error: "Webhook is already processing" }, { status: 503 });
    }
    lockedEventHash = eventHash;
    lockOwnerToken = ownerToken;
    const customerHash = crypto.createHash("sha256").update(email).digest("hex");
    if (!(await acquirePremiumCustomerLock(customerHash, ownerToken))) {
      await abandonPremiumWebhook(eventHash, ownerToken);
      lockedEventHash = null;
      lockOwnerToken = null;
      return NextResponse.json({ error: "Customer entitlement is already updating" }, { status: 503 });
    }
    lockedCustomerHash = customerHash;
    const completeLockedEvent = async () => {
      if (!(await completePremiumWebhook(eventHash, ownerToken))) {
        throw new Error("Webhook event lock expired");
      }
      await releasePremiumCustomerLock(customerHash, ownerToken);
      lockedEventHash = null;
      lockedCustomerHash = null;
      lockOwnerToken = null;
    };

    const status = String(attributes.status || "").toLowerCase();
    const fullyRefunded = attributes.refunded === true || status === "refunded";
    const revocationEvent = movedOffPremium
      || eventName === "subscription_expired"
      || status === "expired"
      || (eventName === "order_refunded" && fullyRefunded)
      || (eventName === "subscription_payment_refunded" && fullyRefunded);

    if (revocationEvent) {
      await revokePremiumByEmail(email, clientId, {
        eventTimestamp,
        orderId: orderId || undefined,
        subscriptionId: subscriptionId || undefined,
        variantId: isConfiguredVariant(variantId) ? variantId : undefined,
      });
      if (movedOffPremium && subscriptionId) {
        await setPremiumSubscriptionBinding(subscriptionId, {
          email,
          variantId: attributeVariantId,
          eventTimestamp,
        });
      }
      await completeLockedEvent();
      return NextResponse.json({ received: true, premium: false });
    }

    const paymentEvent = eventName === "subscription_payment_success"
      || eventName === "subscription_payment_recovered";
    const activationEvent = eventName === "order_created"
      || paymentEvent
      || eventName === "subscription_created"
      || eventName === "subscription_updated"
      || eventName === "subscription_resumed"
      || eventName === "subscription_unpaused"
      || eventName === "subscription_cancelled";
    const activeStatus = eventName === "order_created" || paymentEvent
      ? status === "paid"
      : ["active", "on_trial", "cancelled", "paused", "past_due"].includes(status);

    if (!activationEvent || !activeStatus) {
      await completeLockedEvent();
      return NextResponse.json({ received: true, ignored: true });
    }

    const checkout = nonce && clientId ? await getCheckoutRecord(nonce) : null;
    const expectedVariant = checkout?.plan === "monthly"
      ? LS_CONFIG.variants.premiumMonthly
      : checkout?.plan === "yearly"
        ? LS_CONFIG.variants.premiumYearly
        : null;
    const trustedCheckout = checkout
      && checkout.clientId === clientId
      && expectedVariant === variantId
      ? checkout
      : null;

    const activated = await setPremiumByEmail(email, trustedCheckout ? clientId : undefined, {
      expiresAt: entitlementExpiry(attributes, variantId),
      eventTimestamp,
      orderId: orderId || undefined,
      subscriptionId: subscriptionId || undefined,
      variantId,
    });
    if (!activated) {
      throw new Error("Entitlement store unavailable");
    }

    if (nonce && trustedCheckout) {
      if (
        trustedCheckout.accountUserId
        && trustedCheckout.accountEmail?.toLowerCase() === email
      ) {
        const linked = await bindPremiumUser(trustedCheckout.accountUserId, email);
        if (!linked) throw new Error("Could not link paid account");
      }
      await setCheckoutRecord(nonce, {
        ...trustedCheckout,
        paid: true,
        email,
        orderId: orderId || undefined,
      }, 24 * 60 * 60);
    }

    await completeLockedEvent();
    return NextResponse.json({ received: true, premium: true });
  } catch {
    if (lockedCustomerHash && lockOwnerToken) {
      await releasePremiumCustomerLock(lockedCustomerHash, lockOwnerToken).catch(() => undefined);
    }
    if (lockedEventHash && lockOwnerToken) {
      await abandonPremiumWebhook(lockedEventHash, lockOwnerToken).catch(() => undefined);
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 503 });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
