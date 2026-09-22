import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * PREMIUM_ADMIN_EMAILS owner grant:
 *  - the email lives only in a server-side env var (never in client code),
 *  - it applies exclusively to an authenticated session with that email,
 *  - it works across login, signup, /api/auth/me, verification and claim,
 *  - a matching email must never bypass authentication itself.
 */
const storage = vi.hoisted(() => new Map<string, unknown>());

vi.mock("@vercel/kv", () => ({
  createClient: () => ({
    get: vi.fn(async (key: string) => storage.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      storage.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
    incr: vi.fn(async () => 1),
    expire: vi.fn(async () => 1),
    persist: vi.fn(async () => 1),
    ttl: vi.fn(async () => 60),
    eval: vi.fn(async () => 1),
  }),
}));

import {
  getPremiumStatus,
  getPremiumStatusByUserId,
  grantConfiguredPremium,
  isAdminPremiumEmail,
  keys,
} from "@/lib/kv";

beforeEach(() => {
  storage.clear();
  vi.unstubAllEnvs();
});

describe("configured owner Premium grant", () => {
  it("matches only emails configured through the server-side env var", () => {
    vi.stubEnv("PREMIUM_ADMIN_EMAILS", "Owner@Example.com, support@example.com");
    expect(isAdminPremiumEmail("owner@example.com")).toBe(true);
    expect(isAdminPremiumEmail("OWNER@EXAMPLE.COM")).toBe(true);
    expect(isAdminPremiumEmail(" someone-else@example.com ")).toBe(false);
    expect(isAdminPremiumEmail("")).toBe(false);

    vi.stubEnv("PREMIUM_ADMIN_EMAILS", "");
    expect(isAdminPremiumEmail("owner@example.com")).toBe(false);
  });

  it("keeps the built-in owner email Premium even when no env var is set", () => {
    // Guards against a missing/misnamed Vercel variable: the site owner's
    // account must always resolve as Premium once signed in.
    expect(isAdminPremiumEmail("sultansaqib900@gmail.com")).toBe(true);
    expect(isAdminPremiumEmail("SultanSaqib900@Gmail.com")).toBe(true);
  });

  it("accepts alias env names and tolerates URLs/quotes pasted as values", () => {
    vi.stubEnv("PREMIUM_ADMIN_URL", "https://example.com/claim?email=boss@example.com");
    expect(isAdminPremiumEmail("boss@example.com")).toBe(true);

    vi.stubEnv("ADMIN_EMAIL", "\"admin2@example.com\"");
    expect(isAdminPremiumEmail("admin2@example.com")).toBe(true);
  });

  it("returns true from grantConfiguredPremium even when KV persistence fails", async () => {
    // A KV outage must never revoke a configured owner grant.
    const kvModule = await import("@vercel/kv");
    const client = kvModule.createClient({ url: "", token: "" });
    (client.set as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("kv down"));
    vi.stubEnv("PREMIUM_ADMIN_EMAILS", "owner@example.com");
    await expect(grantConfiguredPremium("user-kv-down", "owner@example.com")).resolves.toBe(true);
  });

  it("persists the grant so cross-device login and device binding observe it", async () => {
    vi.stubEnv("PREMIUM_ADMIN_EMAILS", "owner@example.com");

    expect(await grantConfiguredPremium("user-1", "owner@example.com")).toBe(true);
    expect(storage.get(keys.premiumByUserId("user-1"))).toBe("owner@example.com");

    // The account now resolves as Premium…
    expect(await getPremiumStatusByUserId("user-1")).toBe(true);
    // …and any device bound to the entitlement email is Premium as well.
    await import("@/lib/kv").then(async (kvModule) => {
      await kvModule.bindPremiumClient("owner-device", "owner@example.com");
    });
    expect(await getPremiumStatus("owner-device")).toBe(true);
  });

  it("never grants non-configured accounts", async () => {
    vi.stubEnv("PREMIUM_ADMIN_EMAILS", "owner@example.com");
    expect(await grantConfiguredPremium("user-2", "intruder@example.com")).toBe(false);
    expect(await getPremiumStatusByUserId("user-2")).toBe(false);
  });

  it("fails closed when the environment variable is unset", async () => {
    expect(await grantConfiguredPremium("user-1", "owner@example.com")).toBe(false);
    expect(await getPremiumStatusByUserId("user-1")).toBe(false);
  });
});
