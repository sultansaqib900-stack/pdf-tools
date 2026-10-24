import { LS_CONFIG } from "./lemonsqueezy";
import { FREE_LIMITS, PREMIUM_LIMITS, TRIAL_FILE_LIMIT } from "./premium";
import { PREMIUM_TOOL_COUNT } from "./toolCatalog";

export interface PlanDefinition {
  id: "free" | "monthly" | "yearly";
  name: string;
  price: string;
  amount: number;
  currency: string;
  currencyCode: "PKR";
  period: string;
  billingSummary: string;
  effectiveMonthlyPrice?: string;
  annualSavings?: string;
  annualSavingsPercent?: number;
  features: string[];
  highlighted: boolean;
  checkoutUrl: string | null;
  planKey: "monthly" | "yearly" | null;
}

export interface FeatureComparisonRow {
  feature: string;
  free: string;
  monthly: string;
  yearly: string;
}

/**
 * Standard pricing configuration.
 *
 * All paid subscriptions are billed in Pakistani Rupees (PKR) through Lemon Squeezy
 * under the configured live store (khanbrand, variants 2279735 and 2279736).
 * International cards are automatically converted by the issuing bank at checkout
 * (approx. $9 USD/mo or $45 USD/yr equivalent).
 */
export const PRICING_CONFIG = {
  currency: "Rs",
  currencyCode: "PKR" as const,
  free: {
    amount: 0,
    priceFormatted: "Rs 0",
    period: "forever",
    billingSummary: "Free forever — no account required",
  },
  monthly: {
    amount: 2500,
    priceFormatted: "Rs 2,500",
    period: "/month",
    billingSummary: "Billed monthly in PKR (cancel anytime)",
  },
  yearly: {
    amount: 12500,
    priceFormatted: "Rs 12,500",
    period: "/year",
    billingSummary: "Billed annually in PKR (Rs 12,500/year)",
  },
} as const;

/**
 * Calculate mathematically verified annual savings.
 * 12 months at Rs 2,500 = Rs 30,000/year.
 * Yearly plan is Rs 12,500/year.
 * Savings = Rs 30,000 - Rs 12,500 = Rs 17,500/year (58.3% discount).
 */
export function calculateAnnualSavings() {
  const monthlyAnnualized = PRICING_CONFIG.monthly.amount * 12;
  const yearlyCost = PRICING_CONFIG.yearly.amount;
  const savingsAmount = monthlyAnnualized - yearlyCost;
  const savingsPercent = Math.round((savingsAmount / monthlyAnnualized) * 100);
  const effectiveMonthly = Math.round(yearlyCost / 12);

  return {
    monthlyAnnualized,
    yearlyCost,
    savingsAmount,
    savingsPercent,
    effectiveMonthly,
    savingsFormatted: `Save Rs ${savingsAmount.toLocaleString()}/year (${savingsPercent}% off)`,
    effectiveMonthlyFormatted: `Rs ${effectiveMonthly.toLocaleString()}/month`,
  };
}

export const ANNUAL_SAVINGS = calculateAnnualSavings();

export const PLANS: readonly PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: PRICING_CONFIG.free.priceFormatted,
    amount: PRICING_CONFIG.free.amount,
    currency: PRICING_CONFIG.currency,
    currencyCode: PRICING_CONFIG.currencyCode,
    period: PRICING_CONFIG.free.period,
    billingSummary: PRICING_CONFIG.free.billingSummary,
    features: [
      "All 38 core tools — free & unlimited use",
      "PDF Studio workspace preview included",
      `Professional tools: ${TRIAL_FILE_LIMIT} lifetime trial files (shared)`,
      `Max ${FREE_LIMITS.maxFileSize / (1024 * 1024)}MB files (100MB with Premium)`,
      "No account or payment details required",
      "AI chat preview: 3 questions/day",
    ],
    highlighted: false,
    checkoutUrl: null,
    planKey: null,
  },
  {
    id: "monthly",
    name: "Premium Monthly",
    price: PRICING_CONFIG.monthly.priceFormatted,
    amount: PRICING_CONFIG.monthly.amount,
    currency: PRICING_CONFIG.currency,
    currencyCode: PRICING_CONFIG.currencyCode,
    period: PRICING_CONFIG.monthly.period,
    billingSummary: PRICING_CONFIG.monthly.billingSummary,
    features: [
      "Unlimited basic AND professional tools — no trial limit",
      "PDF Studio multi-step workspace unlocked forever",
      `Max ${PREMIUM_LIMITS.maxFileSize / (1024 * 1024)}MB files`,
      "Batch processing up to 20 files",
      "Unlimited AI questions & AI OCR",
      `${PREMIUM_TOOL_COUNT} professional premium tools`,
      "Priority email support",
    ],
    highlighted: true,
    checkoutUrl: LS_CONFIG.checkoutBaseUrls.premiumMonthly,
    planKey: "monthly",
  },
  {
    id: "yearly",
    name: "Premium Yearly",
    price: PRICING_CONFIG.yearly.priceFormatted,
    amount: PRICING_CONFIG.yearly.amount,
    currency: PRICING_CONFIG.currency,
    currencyCode: PRICING_CONFIG.currencyCode,
    period: PRICING_CONFIG.yearly.period,
    billingSummary: PRICING_CONFIG.yearly.billingSummary,
    effectiveMonthlyPrice: ANNUAL_SAVINGS.effectiveMonthlyFormatted,
    annualSavings: ANNUAL_SAVINGS.savingsFormatted,
    annualSavingsPercent: ANNUAL_SAVINGS.savingsPercent,
    features: [
      "Everything in Monthly",
      `Billed yearly in PKR (${ANNUAL_SAVINGS.savingsFormatted})`,
      `Effective ${ANNUAL_SAVINGS.effectiveMonthlyFormatted}`,
      "Priority email support",
      "Best long-term value",
    ],
    highlighted: false,
    checkoutUrl: LS_CONFIG.checkoutBaseUrls.premiumYearly,
    planKey: "yearly",
  },
];

export const FEATURE_COMPARISON_ROWS: readonly FeatureComparisonRow[] = [
  {
    feature: "Basic tools (Compress, Merge, Split, Sign, …)",
    free: "Unlimited (38 tools)",
    monthly: "Unlimited",
    yearly: "Unlimited",
  },
  {
    feature: "PDF Studio Pipeline",
    free: "Preview only",
    monthly: "Full access forever",
    yearly: "Full access forever",
  },
  {
    feature: "Professional tools trial",
    free: `${TRIAL_FILE_LIMIT} files — lifetime, shared`,
    monthly: "Unlimited",
    yearly: "Unlimited",
  },
  {
    feature: "File size limit",
    free: "10MB",
    monthly: "100MB",
    yearly: "100MB",
  },
  {
    feature: "Batch processing",
    free: "—",
    monthly: "Up to 20 files",
    yearly: "Up to 20 files",
  },
  {
    feature: "AI questions & AI OCR",
    free: "3 requests/day preview",
    monthly: "Unlimited",
    yearly: "Unlimited",
  },
  {
    feature: "Priority support",
    free: "Community / FAQ",
    monthly: "Email",
    yearly: "Priority email",
  },
  {
    feature: "Future pro tools",
    free: "—",
    monthly: "Included",
    yearly: "Included",
  },
];

