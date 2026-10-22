import { describe, it, expect } from "vitest";
import {
  LS_CONFIG,
  buildCheckoutUrl,
  isConfiguredVariant,
} from "@/lib/lemonsqueezy";

describe("LS_CONFIG", () => {
  it("has store checkout URLs and configured variants", () => {
    expect(LS_CONFIG.storeSlug).toBe("khanbrand");
    expect(LS_CONFIG.checkoutBaseUrls.premiumMonthly).toBe("https://khanbrand.lemonsqueezy.com/checkout/buy/56df7a55-fe05-4938-9640-f0c7dadfd26d");
    expect(LS_CONFIG.variants.premiumMonthly).toBe("2279735");
    expect(LS_CONFIG.checkoutBaseUrls.premiumYearly).toBe("https://khanbrand.lemonsqueezy.com/checkout/buy/6645622c-1e35-447a-96d1-001926cf09f1");
    expect(LS_CONFIG.variants.premiumYearly).toBe("2279736");
    expect(isConfiguredVariant("1824885")).toBe(false);
    expect(isConfiguredVariant("1824911")).toBe(false);
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
