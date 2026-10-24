import { describe, it, expect } from "vitest";
import { PRICING_CONFIG, PLANS, FEATURE_COMPARISON_ROWS, calculateAnnualSavings } from "@/lib/pricing";
import { LS_CONFIG } from "@/lib/lemonsqueezy";
import { FREE_LIMITS, PREMIUM_LIMITS, TRIAL_FILE_LIMIT } from "@/lib/premium";

describe("Unified Pricing & Plans Configuration", () => {
  it("defines standard currency and pricing constants in PKR", () => {
    expect(PRICING_CONFIG.currencyCode).toBe("PKR");
    expect(PRICING_CONFIG.currency).toBe("Rs");
    expect(PRICING_CONFIG.free.amount).toBe(0);
    expect(PRICING_CONFIG.monthly.amount).toBe(2500);
    expect(PRICING_CONFIG.yearly.amount).toBe(12500);
  });

  it("calculates mathematically valid annual savings", () => {
    const savings = calculateAnnualSavings();
    // 12 months at Rs 2,500 = Rs 30,000
    expect(savings.monthlyAnnualized).toBe(30000);
    expect(savings.yearlyCost).toBe(12500);
    // Savings = 30,000 - 12,500 = 17,500
    expect(savings.savingsAmount).toBe(17500);
    // (17,500 / 30,000) * 100 = 58.333% -> 58%
    expect(savings.savingsPercent).toBe(58);
    // Effective monthly = 12,500 / 12 = 1,041.666 -> 1,042
    expect(savings.effectiveMonthly).toBe(1042);
    expect(savings.savingsFormatted).toContain("Save Rs 17,500/year (58% off)");
    expect(savings.effectiveMonthlyFormatted).toBe("Rs 1,042/month");
  });

  it("exports three canonical plans with explicit limits and correct checkout URLs", () => {
    expect(PLANS).toHaveLength(3);

    const [free, monthly, yearly] = PLANS;

    // Free plan
    expect(free.id).toBe("free");
    expect(free.name).toBe("Free");
    expect(free.price).toBe("Rs 0");
    expect(free.amount).toBe(0);
    expect(free.checkoutUrl).toBeNull();
    expect(free.planKey).toBeNull();
    expect(free.features.some((f) => f.includes(`${TRIAL_FILE_LIMIT} lifetime trial files`))).toBe(true);
    expect(free.features.some((f) => f.includes(`${FREE_LIMITS.maxFileSize / (1024 * 1024)}MB`))).toBe(true);

    // Monthly plan
    expect(monthly.id).toBe("monthly");
    expect(monthly.name).toBe("Premium Monthly");
    expect(monthly.price).toBe("Rs 2,500");
    expect(monthly.amount).toBe(2500);
    expect(monthly.checkoutUrl).toBe(LS_CONFIG.checkoutBaseUrls.premiumMonthly);
    expect(monthly.planKey).toBe("monthly");
    expect(monthly.highlighted).toBe(true);
    expect(monthly.features.some((f) => f.includes(`${PREMIUM_LIMITS.maxFileSize / (1024 * 1024)}MB`))).toBe(true);

    // Yearly plan
    expect(yearly.id).toBe("yearly");
    expect(yearly.name).toBe("Premium Yearly");
    expect(yearly.price).toBe("Rs 12,500");
    expect(yearly.amount).toBe(12500);
    expect(yearly.checkoutUrl).toBe(LS_CONFIG.checkoutBaseUrls.premiumYearly);
    expect(yearly.planKey).toBe("yearly");
    expect(yearly.annualSavings).toBeDefined();
    expect(yearly.effectiveMonthlyPrice).toBe("Rs 1,042/month");
  });

  it("provides comprehensive feature comparison rows without stale trial claims", () => {
    expect(FEATURE_COMPARISON_ROWS.length).toBeGreaterThanOrEqual(6);
    const studioRow = FEATURE_COMPARISON_ROWS.find((r) => r.feature.includes("Studio"));
    expect(studioRow).toBeDefined();
    expect(studioRow?.free).toBe("Preview only");
    expect(studioRow?.monthly).toBe("Full access forever");

    const proTrialRow = FEATURE_COMPARISON_ROWS.find((r) => r.feature.includes("Professional tools trial"));
    expect(proTrialRow?.free).toContain("5 files — lifetime, shared");
    expect(proTrialRow?.monthly).toBe("Unlimited");
  });
});

