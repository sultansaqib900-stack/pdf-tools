import { describe, it, expect } from "vitest";
import {
  LS_CONFIG,
  buildCheckoutUrl,
} from "@/lib/lemonsqueezy";

describe("LS_CONFIG", () => {
  it("has store slug and checkout URLs", () => {
    expect(LS_CONFIG.storeSlug).toBe("khanbrand");
    expect(LS_CONFIG.checkoutBaseUrls.premiumMonthly).toContain("lemonsqueezy.com");
    expect(LS_CONFIG.checkoutBaseUrls.premiumYearly).toContain("lemonsqueezy.com");
  });

  it("has variant IDs", () => {
    expect(LS_CONFIG.variants.premiumMonthly).toBeTruthy();
    expect(LS_CONFIG.variants.premiumYearly).toBeTruthy();
  });
});

describe("buildCheckoutUrl", () => {
  it("builds a valid checkout URL for monthly plan with nonce", () => {
    const url = buildCheckoutUrl("monthly", "test-nonce-123");
    expect(url).toContain("lemonsqueezy.com/checkout/buy/");
    expect(url).toContain(encodeURIComponent("nonce=test-nonce-123"));
  });

  it("builds a valid checkout URL for yearly plan with nonce", () => {
    const url = buildCheckoutUrl("yearly", "test-nonce-456");
    expect(url).toContain("lemonsqueezy.com/checkout/buy/");
    expect(url).toContain(encodeURIComponent("nonce=test-nonce-456"));
  });
});
