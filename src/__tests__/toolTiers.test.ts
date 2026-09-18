import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  BASIC_TOOLS,
  getToolTier,
  PREMIUM_TOOLS,
  PROFESSIONAL_TRIAL_TOOLS,
  TOOL_CATALOG,
} from "@/lib/toolCatalog";

describe("tool tier classification (free-unlimited vs shared lifetime trial)", () => {
  it("keeps every basic/core tool unlimited — they never consume the trial", () => {
    const mustBeBasic = [
      "/compress",
      "/merge",
      "/split",
      "/delete-pages",
      "/rotate",
      "/crop",
      "/resize",
      "/extract-text",
      "/image-to-pdf",
      "/pdf-to-images",
      "/pdf-to-word",
      "/word-to-pdf",
      "/protect",
      "/unlock",
      "/sign",
      "/watermark",
      "/add-page-numbers",
      "/annotate",
      "/fill-form",
      "/flatten-pdf",
      "/reverse-pdf",
      "/insert-blank",
      "/metadata",
      "/edit-pdf",
      "/ocr-pdf",
      "/word-counter",
      "/pdf-to-excel",
    ];
    for (const route of mustBeBasic) {
      expect(getToolTier(route), `${route} must be a free unlimited basic tool`).toBe("basic");
    }
    expect(BASIC_TOOLS.length).toBeGreaterThanOrEqual(mustBeBasic.length);
  });

  it("classifies exactly the professional roster as trial-consuming", () => {
    const expected = [
      "/studio",
      "/pdf-diff",
      "/bates-numbering",
      "/certificate-generator",
      "/form-data-extract",
      "/bulk-rename",
      "/booklet",
      "/search-redact",
      "/metadata-sanitizer",
      "/split-by-bookmarks",
    ].sort();
    expect(PROFESSIONAL_TRIAL_TOOLS.map((tool) => tool.href).sort()).toEqual(expected);
    // Tier resolution is invariant to a leading slash.
    expect(getToolTier("pdf-diff")).toBe("professional");
    expect(getToolTier("/pdf-diff")).toBe("professional");
  });

  it("leaves the AI preview tools out of the file-trial (they have their own quota)", () => {
    for (const route of ["/chat-pdf", "/pii-guardian", "/recipes", "/batch", "/vault", "/pdf-to-audio"]) {
      expect(getToolTier(route)).toBe("basic");
    }
  });

  it("keeps the catalog consistent: every tool resolves to a valid tier", () => {
    for (const tool of TOOL_CATALOG) {
      expect(["basic", "professional"]).toContain(getToolTier(tool.href));
    }
    // Trial tools are a subset of the premium roster plus Studio.
    for (const tool of PROFESSIONAL_TRIAL_TOOLS) {
      expect(tool.category === "Premium" || tool.href === "/studio").toBe(true);
    }
  });

  it("does not reintroduce any premium-route gate file (replaced by TrialGate)", () => {
    // PremiumGate was replaced by TrialGate, which allows a free lifetime trial.
    for (const tool of PREMIUM_TOOLS) {
      const slug = tool.href.replace(/^\//, "");
      if (["chat-pdf", "pii-guardian", "recipes", "batch"].includes(slug)) continue;
      const source = readFileSync(join(process.cwd(), "src", "app", slug, "page.tsx"), "utf8");
      expect(source).toContain("TrialGate");
    }
  });
});
