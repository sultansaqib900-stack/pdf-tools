export const LS_CONFIG = {
  storeSlug: "khanbrand",

  apiKey: "",

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
};

export function buildCheckoutUrl(plan: "monthly" | "yearly", nonce: string): string {
  const base = plan === "monthly"
    ? LS_CONFIG.checkoutBaseUrls.premiumMonthly
    : LS_CONFIG.checkoutBaseUrls.premiumYearly;
  const redirect = `${LS_CONFIG.redirectBaseUrl}?success=true&nonce=${nonce}`;
  return `${base}?checkout[redirect_url]=${encodeURIComponent(redirect)}`;
}
