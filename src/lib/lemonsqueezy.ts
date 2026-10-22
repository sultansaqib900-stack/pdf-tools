export const LS_CONFIG = {
  storeSlug: "khanbrand",

  variants: {
    premiumMonthly: "2279735",
    premiumYearly: "2279736",
  },

  checkoutBaseUrls: {
    premiumMonthly: "https://khanbrand.lemonsqueezy.com/checkout/buy/56df7a55-fe05-4938-9640-f0c7dadfd26d",
    premiumYearly: "https://khanbrand.lemonsqueezy.com/checkout/buy/6645622c-1e35-447a-96d1-001926cf09f1",
  },

  redirectBaseUrl: "https://allaboutpdfediting.xyz/premium",
  enabled: true,
} as const;

export function buildCheckoutUrl(
  plan: "monthly" | "yearly",
  nonce: string,
  clientId: string,
  email?: string,
): string {
  const base = plan === "monthly"
    ? LS_CONFIG.checkoutBaseUrls.premiumMonthly
    : LS_CONFIG.checkoutBaseUrls.premiumYearly;
  const redirect = `${LS_CONFIG.redirectBaseUrl}?payment=confirming&nonce=${encodeURIComponent(nonce)}`;
  const url = new URL(base);
  url.searchParams.set("checkout[redirect_url]", redirect);
  url.searchParams.set("checkout[custom][client_id]", clientId);
  url.searchParams.set("checkout[custom][checkout_nonce]", nonce);
  url.searchParams.set("checkout[custom][plan]", plan);
  if (email) {
    url.searchParams.set("checkout[email]", email);
    url.searchParams.set("checkout[custom][account_email]", email);
  }
  return url.toString();
}

export function isConfiguredVariant(variantId: unknown): boolean {
  const value = String(variantId ?? "");
  return value === LS_CONFIG.variants.premiumMonthly || value === LS_CONFIG.variants.premiumYearly;
}
