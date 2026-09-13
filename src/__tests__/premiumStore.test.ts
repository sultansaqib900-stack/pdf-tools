import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, unknown>());

vi.mock("@vercel/kv", () => ({
  createClient: () => ({
    get: vi.fn(async (key: string) => storage.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown, options?: { nx?: boolean }) => {
      if (options?.nx && storage.has(key)) return null;
      storage.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key: string) => storage.delete(key)),
    incr: vi.fn(async (key: string) => {
      const next = Number(storage.get(key) || 0) + 1;
      storage.set(key, next);
      return next;
    }),
    expire: vi.fn(async () => 1),
    persist: vi.fn(async () => 1),
    ttl: vi.fn(async () => 60),
    eval: vi.fn(async (script: string, keyList: string[], args: string[]) => {
      const key = keyList[0];
      if (storage.get(key) !== args[0]) return 0;
      if (script.includes('"processed"')) storage.set(key, "processed");
      else storage.delete(key);
      return 1;
    }),
  }),
}));

import {
  acquirePremiumCustomerLock,
  beginPremiumWebhook,
  bindPremiumClient,
  bindPremiumUser,
  completePremiumWebhook,
  getPremiumStatus,
  getPremiumStatusByEmail,
  getPremiumStatusByUserId,
  getPremiumSubscriptionBinding,
  incrementDailyUsage,
  keys,
  releasePremiumCustomerLock,
  revokePremiumByEmail,
  setPremiumByEmail,
} from "@/lib/kv";

const future = "2035-01-01T00:00:00.000Z";

beforeEach(() => storage.clear());

describe("authoritative Premium store", () => {
  it("rejects legacy records that were forgeable without verified payment", async () => {
    storage.set(keys.premiumByEmail("legacy@example.com"), true);
    storage.set(keys.premiumByClientId("legacy-device"), true);
    storage.set(keys.premiumByEmail("structured-legacy@example.com"), {
      active: true,
      source: "legacy",
      expiresAt: future,
    });
    storage.set(keys.premiumByClientId("structured-legacy-device"), "structured-legacy@example.com");

    expect(await getPremiumStatusByEmail("legacy@example.com")).toBe(false);
    expect(await getPremiumStatusByEmail("structured-legacy@example.com")).toBe(false);
    expect(await getPremiumStatus("legacy-device")).toBe(false);
    expect(await getPremiumStatus("structured-legacy-device")).toBe(false);
  });

  it("migrates only prior structured Lemon Squeezy records", async () => {
    storage.set(keys.premiumByEmail("verified@example.com"), {
      active: true,
      source: "lemon-squeezy",
      expiresAt: future,
      eventTimestamp: "2026-01-01T00:00:00.000Z",
      subscriptionId: "subscription-verified",
      variantId: "1824885",
    });

    expect(await getPremiumStatusByEmail("verified@example.com")).toBe(true);
    await revokePremiumByEmail("verified@example.com", undefined, {
      eventTimestamp: "2026-02-01T00:00:00.000Z",
      subscriptionId: "subscription-verified",
      variantId: "1824885",
    });
    expect(await getPremiumStatusByEmail("verified@example.com")).toBe(false);
  });

  it("requires an explicit paid-checkout link before an account can restore access", async () => {
    await setPremiumByEmail("buyer@example.com", "checkout-device", {
      expiresAt: future,
      eventTimestamp: "2026-01-01T00:00:00.000Z",
    });

    expect(await getPremiumStatus("checkout-device")).toBe(true);
    expect(await getPremiumStatusByUserId("user-1")).toBe(false);

    expect(await bindPremiumUser("user-1", "buyer@example.com")).toBe(true);
    expect(await getPremiumStatusByUserId("user-1")).toBe(true);
    expect(await bindPremiumClient("second-device", "buyer@example.com")).toBe(true);
    expect(await getPremiumStatus("second-device")).toBe(true);
  });

  it("keeps revocation authoritative over delayed activation events", async () => {
    await setPremiumByEmail("buyer@example.com", "device", {
      expiresAt: future,
      eventTimestamp: "2026-01-01T00:00:00.000Z",
      subscriptionId: "subscription-1",
      variantId: "1824885",
    });
    await bindPremiumUser("user-1", "buyer@example.com");
    await revokePremiumByEmail("buyer@example.com", undefined, {
      eventTimestamp: "2026-02-01T00:00:00.000Z",
      subscriptionId: "subscription-1",
      variantId: "1824885",
    });

    expect(await getPremiumStatus("device")).toBe(false);
    expect(await getPremiumStatusByUserId("user-1")).toBe(false);

    await setPremiumByEmail("buyer@example.com", "device", {
      expiresAt: future,
      eventTimestamp: "2026-01-15T00:00:00.000Z",
      subscriptionId: "subscription-1",
      variantId: "1824885",
    });
    expect(await getPremiumStatus("device")).toBe(false);
    expect(await getPremiumSubscriptionBinding("subscription-1")).toEqual(expect.objectContaining({
      email: "buyer@example.com",
      variantId: "1824885",
    }));

    await setPremiumByEmail("buyer@example.com", "device", {
      expiresAt: future,
      eventTimestamp: "2026-03-01T00:00:00.000Z",
      subscriptionId: "subscription-1",
      variantId: "1824885",
    });
    expect(await getPremiumStatus("device")).toBe(true);
    expect(await getPremiumStatusByUserId("user-1")).toBe(true);
  });

  it("keeps access while any independent verified purchase remains active", async () => {
    await setPremiumByEmail("multi@example.com", "multi-device", {
      expiresAt: future,
      eventTimestamp: "2026-01-01T00:00:00.000Z",
      orderId: "order-a",
      subscriptionId: "subscription-a",
      variantId: "1824885",
    });
    await setPremiumByEmail("multi@example.com", undefined, {
      expiresAt: future,
      eventTimestamp: "2026-01-02T00:00:00.000Z",
      orderId: "order-b",
      subscriptionId: "subscription-b",
      variantId: "1824911",
    });

    await revokePremiumByEmail("multi@example.com", undefined, {
      eventTimestamp: "2026-02-01T00:00:00.000Z",
      orderId: "order-a",
      subscriptionId: "subscription-a",
      variantId: "1824885",
    });
    expect(await getPremiumStatus("multi-device")).toBe(true);

    await revokePremiumByEmail("multi@example.com", undefined, {
      eventTimestamp: "2026-02-02T00:00:00.000Z",
      orderId: "order-b",
      subscriptionId: "subscription-b",
      variantId: "1824911",
    });
    expect(await getPremiumStatus("multi-device")).toBe(false);
  });

  it("correlates an order grant with its subscription lifecycle", async () => {
    await setPremiumByEmail("correlated@example.com", "correlated-device", {
      expiresAt: future,
      eventTimestamp: "2026-01-01T00:00:00.000Z",
      orderId: "order-1",
      variantId: "1824885",
    });
    await setPremiumByEmail("correlated@example.com", undefined, {
      expiresAt: future,
      eventTimestamp: "2026-01-02T00:00:00.000Z",
      orderId: "order-1",
      subscriptionId: "subscription-1",
      variantId: "1824885",
    });
    await revokePremiumByEmail("correlated@example.com", undefined, {
      eventTimestamp: "2026-02-01T00:00:00.000Z",
      orderId: "order-1",
      variantId: "1824885",
    });

    expect(await getPremiumStatus("correlated-device")).toBe(false);
  });

  it("atomically rejects processing beyond the five-use free allowance", async () => {
    for (let index = 0; index < 5; index += 1) {
      expect((await incrementDailyUsage("free-device")).ok).toBe(true);
    }
    const blocked = await incrementDailyUsage("free-device");
    expect(blocked).toEqual(expect.objectContaining({ ok: false, remaining: 0, count: 6 }));
  });

  it("deduplicates an exact signed webhook event", async () => {
    expect(await beginPremiumWebhook("event-hash", "owner-1")).toBe("acquired");
    expect(await beginPremiumWebhook("event-hash", "owner-2")).toBe("busy");
    expect(await completePremiumWebhook("event-hash", "owner-2")).toBe(false);
    expect(await completePremiumWebhook("event-hash", "owner-1")).toBe(true);
    expect(await beginPremiumWebhook("event-hash", "owner-3")).toBe("processed");
  });

  it("does not let a stale worker release another customer's lock", async () => {
    expect(await acquirePremiumCustomerLock("customer-hash", "owner-1")).toBe(true);
    expect(await acquirePremiumCustomerLock("customer-hash", "owner-2")).toBe(false);
    await releasePremiumCustomerLock("customer-hash", "owner-2");
    expect(await acquirePremiumCustomerLock("customer-hash", "owner-2")).toBe(false);
    await releasePremiumCustomerLock("customer-hash", "owner-1");
    expect(await acquirePremiumCustomerLock("customer-hash", "owner-2")).toBe(true);
  });
});
