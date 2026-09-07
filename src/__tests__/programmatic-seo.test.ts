import { describe, it, expect } from "vitest";
import { seoPages, indexableSeoPages, getAllSeoPages } from "@/lib/programmatic-seo";

describe("programmatic SEO pages", () => {
  it("marks only a small curated subset as indexable", () => {
    expect(indexableSeoPages.length).toBeGreaterThan(0);
    // The whole point of the AdSense fix: we must not submit hundreds of
    // template permutations to the index.
    expect(indexableSeoPages.length).toBeLessThanOrEqual(30);
    expect(indexableSeoPages.length).toBeLessThan(seoPages.length);
  });

  it("every indexable page has tool-specific FAQs, not the generic fallback", () => {
    for (const p of indexableSeoPages) {
      expect(p.faqs.length).toBeGreaterThan(0);
      expect(p.toolSlug).toBeTruthy();
      expect(p.faqs.some((f) => f.question === "Is this really free?")).toBe(false);
    }
  });

  it("generates deterministic content across builds", () => {
    const a = getAllSeoPages();
    const b = getAllSeoPages();
    expect(a.map((p) => p.painPoint)).toEqual(b.map((p) => p.painPoint));
  });

  it("has unique slugs", () => {
    expect(new Set(seoPages.map((p) => p.slug)).size).toBe(seoPages.length);
  });

  it("exposes all pain points so pages can render substantive copy", () => {
    for (const p of indexableSeoPages) {
      expect(p.painPoints.length).toBeGreaterThanOrEqual(2);
      expect(p.painPoints).toContain(p.painPoint);
    }
  });
});
