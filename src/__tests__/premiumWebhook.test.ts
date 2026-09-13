import crypto from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const kvMocks = vi.hoisted(() => ({
  abandonPremiumWebhook: vi.fn(async () => undefined),
  acquirePremiumCustomerLock: vi.fn(async () => true),
  beginPremiumWebhook: vi.fn(async () => "acquired" as const),
  bindPremiumUser: vi.fn(async () => true),
  completePremiumWebhook: vi.fn(async () => true),
  getCheckoutRecord: vi.fn(),
  getPremiumSubscriptionBinding: vi.fn(async (): Promise<{ email: string; variantId: string; eventTimestamp?: string } | null> => null),
  releasePremiumCustomerLock: vi.fn(async () => undefined),
  revokePremiumByEmail: vi.fn(async () => undefined),
  setCheckoutRecord: vi.fn(async () => undefined),
  setPremiumByEmail: vi.fn(async () => true),
  setPremiumSubscriptionBinding: vi.fn(async () => undefined),
}));

vi.mock("@/lib/kv", () => kvMocks);

const secret = "unit-test-webhook-secret";

function signedRequest(payload: Record<string, unknown>, valid = true): Request {
  const body = JSON.stringify(payload);
  const signature = valid
    ? crypto.createHmac("sha256", secret).update(body).digest("hex")
    : "invalid";
  return new Request("https://example.com/api/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature": signature },
    body,
  });
}

function orderPayload(overrides: Record<string, unknown> = {}) {
  return {
    meta: {
      event_name: "order_created",
      custom_data: { client_id: "client-1", checkout_nonce: "nonce-1", plan: "monthly" },
    },
    data: {
      id: "order-1",
      attributes: {
        user_email: "buyer@example.com",
        status: "paid",
        first_order_item: { variant_id: 1824885 },
        created_at: "2026-01-01T00:00:00.000Z",
        ...overrides,
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubEnv("LEMONSQUEEZY_WEBHOOK_SECRET", secret);
  vi.stubEnv("LEMONSQUEEZY_ALLOW_TEST_MODE", "false");
  kvMocks.beginPremiumWebhook.mockResolvedValue("acquired");
  kvMocks.bindPremiumUser.mockResolvedValue(true);
  kvMocks.getPremiumSubscriptionBinding.mockResolvedValue(null);
  kvMocks.setPremiumByEmail.mockResolvedValue(true);
});

describe("Lemon Squeezy Premium webhook", () => {
  it("rejects a payload without a valid HMAC before touching entitlement state", async () => {
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(orderPayload(), false));
    expect(response.status).toBe(401);
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
  });

  it("ignores signed test-mode purchases unless explicitly enabled", async () => {
    const { POST } = await import("@/app/api/webhook/route");
    const payload = orderPayload({ test_mode: true });
    const response = await POST(signedRequest(payload));
    expect(response.status).toBe(200);
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
  });

  it("activates and links only a matching server-created checkout", async () => {
    kvMocks.getCheckoutRecord.mockResolvedValue({
      clientId: "client-1",
      plan: "monthly",
      paid: false,
      used: false,
      accountUserId: "user-1",
      accountEmail: "buyer@example.com",
    });
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(orderPayload()));

    expect(response.status).toBe(200);
    expect(kvMocks.setPremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      "client-1",
      expect.objectContaining({ variantId: "1824885", orderId: "order-1" }),
    );
    expect(kvMocks.bindPremiumUser).toHaveBeenCalledWith("user-1", "buyer@example.com");
    expect(kvMocks.setCheckoutRecord).toHaveBeenCalledWith(
      "nonce-1",
      expect.objectContaining({ paid: true, email: "buyer@example.com" }),
      86_400,
    );
  });

  it("does not bind arbitrary custom client data without its pending checkout", async () => {
    kvMocks.getCheckoutRecord.mockResolvedValue(null);
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(orderPayload()));

    expect(response.status).toBe(200);
    expect(kvMocks.setPremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      undefined,
      expect.any(Object),
    );
    expect(kvMocks.setCheckoutRecord).not.toHaveBeenCalled();
    expect(kvMocks.bindPremiumUser).not.toHaveBeenCalled();
  });

  it("uses the stored subscription mapping for renewal invoice events", async () => {
    kvMocks.getPremiumSubscriptionBinding.mockResolvedValue({
      email: "buyer@example.com",
      variantId: "1824885",
    });
    const payload = {
      meta: { event_name: "subscription_payment_success" },
      data: {
        id: "invoice-2",
        attributes: {
          subscription_id: "subscription-1",
          user_email: "buyer@example.com",
          status: "paid",
          updated_at: "2026-03-01T00:00:00.000Z",
        },
      },
    };
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.setPremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      undefined,
      expect.objectContaining({
        subscriptionId: "subscription-1",
        variantId: "1824885",
      }),
    );
  });

  it("writes a terminal entitlement for a fully refunded order", async () => {
    const payload = orderPayload({ status: "refunded", refunded: true, updated_at: "2026-02-01T00:00:00.000Z" });
    payload.meta.event_name = "order_refunded";
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.revokePremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      "client-1",
      expect.objectContaining({ eventTimestamp: "2026-02-01T00:00:00.000Z" }),
    );
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
  });

  it("retains access after a partial refund", async () => {
    const payload = orderPayload({
      status: "partial_refund",
      refunded: false,
      refunded_amount: 100,
      total: 999,
      updated_at: "2026-02-01T00:00:00.000Z",
    });
    payload.meta.event_name = "order_refunded";
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.revokePremiumByEmail).not.toHaveBeenCalled();
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
    expect(kvMocks.completePremiumWebhook).toHaveBeenCalled();
  });

  it("revokes an expired mapped subscription", async () => {
    kvMocks.getPremiumSubscriptionBinding.mockResolvedValue({
      email: "buyer@example.com",
      variantId: "1824885",
    });
    const payload = {
      meta: { event_name: "subscription_expired" },
      data: {
        id: "subscription-1",
        attributes: {
          user_email: "buyer@example.com",
          status: "expired",
          updated_at: "2026-04-01T00:00:00.000Z",
        },
      },
    };
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.revokePremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      undefined,
      expect.objectContaining({
        subscriptionId: "subscription-1",
        variantId: "1824885",
      }),
    );
  });

  it("revokes a mapped subscription that moves to an unconfigured product variant", async () => {
    kvMocks.getPremiumSubscriptionBinding.mockResolvedValue({
      email: "buyer@example.com",
      variantId: "1824885",
    });
    const payload = {
      meta: { event_name: "subscription_updated" },
      data: {
        id: "subscription-1",
        attributes: {
          user_email: "buyer@example.com",
          variant_id: 9999999,
          status: "active",
          updated_at: "2026-04-01T00:00:00.000Z",
        },
      },
    };
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.revokePremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      undefined,
      expect.objectContaining({
        subscriptionId: "subscription-1",
        variantId: "1824885",
      }),
    );
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
    expect(kvMocks.setPremiumSubscriptionBinding).toHaveBeenCalledWith(
      "subscription-1",
      expect.objectContaining({ email: "buyer@example.com", variantId: "9999999" }),
    );
  });

  it("does not reactivate a non-Premium mapped subscription from an invoice-only event", async () => {
    kvMocks.getPremiumSubscriptionBinding.mockResolvedValue({
      email: "buyer@example.com",
      variantId: "9999999",
      eventTimestamp: "2026-04-01T00:00:00.000Z",
    });
    const payload = {
      meta: { event_name: "subscription_payment_success" },
      data: {
        id: "invoice-3",
        attributes: {
          subscription_id: "subscription-1",
          user_email: "buyer@example.com",
          status: "paid",
          updated_at: "2026-05-01T00:00:00.000Z",
        },
      },
    };
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({
      ignored: "non-premium-subscription",
    }));
    expect(kvMocks.setPremiumByEmail).not.toHaveBeenCalled();
    expect(kvMocks.revokePremiumByEmail).not.toHaveBeenCalled();
  });

  it("keeps the stored entitlement owner when a subscription billing email changes", async () => {
    kvMocks.getPremiumSubscriptionBinding.mockResolvedValue({
      email: "buyer@example.com",
      variantId: "1824885",
    });
    const payload = {
      meta: { event_name: "subscription_updated" },
      data: {
        id: "subscription-1",
        attributes: {
          user_email: "changed@example.com",
          status: "active",
          renews_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-04-01T00:00:00.000Z",
        },
      },
    };
    const { POST } = await import("@/app/api/webhook/route");
    const response = await POST(signedRequest(payload));

    expect(response.status).toBe(200);
    expect(kvMocks.setPremiumByEmail).toHaveBeenCalledWith(
      "buyer@example.com",
      undefined,
      expect.objectContaining({ subscriptionId: "subscription-1" }),
    );
    expect(kvMocks.revokePremiumByEmail).not.toHaveBeenCalled();
  });
});
