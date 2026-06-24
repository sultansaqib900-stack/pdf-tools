// === LEMON SQUEEZY CONFIGURATION ===
// Sign up at https://lemonsqueezy.com (works in Pakistan)
// Payouts via bank transfer (1% fee) or PayPal (3% fee)
//
// Setup:
// 1. Create account → Create a store
// 2. Create a product with two variants (or two separate products):
//    - "Premium Monthly" — PKR 2,500/month (subscription)
//    - "Premium Yearly" — PKR 8,500/year (subscription)
// 3. Copy the variant IDs and store ID from dashboard URLs
// 4. Optional: create an API key at Settings → API

export const LS_CONFIG = {
  // Your store slug and ID from Lemon Squeezy dashboard
  storeSlug: "khanbrand",
  storeId: "XXXXXXXX", // find in Dashboard → Stores → click your store

  // API Key (optional — only needed for dynamic checkout generation)
  // Create at: Settings → API → Generate API key
  apiKey: "",

  // Variant IDs for your products
  variants: {
    premiumMonthly: "1824885",
    premiumYearly: "1824911",
  },

  // Direct checkout URLs from Lemon Squeezy dashboard
  checkoutUrls: {
    premiumMonthly: "https://khanbrand.lemonsqueezy.com/checkout/buy/a09b2382-cfaa-4fb2-9ba9-6c269dd92a0e?checkout[redirect_url]=https://allaboutpdfediting.xyz/premium%3Fsuccess%3Dtrue",
    premiumYearly: "https://khanbrand.lemonsqueezy.com/checkout/buy/e009ffff-808b-4593-9156-c42e31eb06ba?checkout[redirect_url]=https://allaboutpdfediting.xyz/premium%3Fsuccess%3Dtrue",
  },

  // Set to true to enable checkout buttons
  enabled: true,
};
