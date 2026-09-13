import { describe, it, expect } from "vitest";
import {
  LS_CONFIG,
  buildCheckoutUrl,
  isConfiguredVariant,
} from "@/lib/lemonsqueezy";

describe("LS_CONFIG", () => {
  it("has store checkout URLs and configured variants", () => {
    expect(LS_CONFIG.storeSlug).toBe("khanbrand");
    expect(LS_CONFIG.checkoutBaseUrls.premiumMonthly).toContain("lemonsqueezy.com");
    expect(LS_CONFIG.checkoutBaseUrls.premiumYearly).toContain("lemonsqueezy.com");
    expect(isConfiguredVariant(LS_CONFIG.variants.premiumMonthly)).toBe(true);
    expect(isConfiguredVariant(LS_CONFIG.variants.premiumYearly)).toBe(true);
    expect(isConfiguredVariant("attacker-variant")).toBe(false);
  });
});

describe("buildCheckoutUrl", () => {
  it("attaches server-created checkout identity as Lemon Squeezy custom data", () => {
    const value = buildCheckoutUrl("monthly", "test-nonce-123", "client-abc", "buyer@example.com");
    const url = new URL(value);

    expect(`${url.origin}${url.pathname}`).toBe(LS_CONFIG.checkoutBaseUrls.premiumMonthly);
    expect(url.searchParams.get("checkout[custom][checkout_nonce]")).toBe("test-nonce-123");
    expect(url.searchParams.get("checkout[custom][client_id]")).toBe("client-abc");
    expect(url.searchParams.get("checkout[custom][plan]")).toBe("monthly");
    expect(url.searchParams.get("checkout[email]")).toBe("buyer@example.com");
    expect(url.searchParams.get("checkout[custom][account_email]")).toBe("buyer@example.com");
    expect(url.searchParams.get("checkout[redirect_url]")).toContain("payment=confirming");
    expect(url.searchParams.get("checkout[redirect_url]")).toContain("nonce=test-nonce-123");
  });

  it("uses the yearly checkout and does not invent an email", () => {
    const url = new URL(buildCheckoutUrl("yearly", "test-nonce-456", "client-xyz"));
    expect(`${url.origin}${url.pathname}`).toBe(LS_CONFIG.checkoutBaseUrls.premiumYearly);
    expect(url.searchParams.get("checkout[custom][checkout_nonce]")).toBe("test-nonce-456");
    expect(url.searchParams.has("checkout[email]")).toBe(false);
  });
});
