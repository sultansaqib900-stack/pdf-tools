export const LS_CONFIG = {
  storeSlug: "khanbrand",

  variants: {
    premiumMonthly: "1824885",
    premiumYearly: "1824911",
  },

  checkoutBaseUrls: {
    premiumMonthly: "https://khanbrand.lemonsqueezy.com/checkout/buy/a09b2382-cfaa-4fb2-9ba9-6c269dd92a0e",
    premiumYearly: "https://khanbrand.lemonsqueezy.com/checkout/buy/e009ffff-808b-4593-9156-c42e31eb06ba",
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
