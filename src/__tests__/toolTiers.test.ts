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
    // Every trial tool belongs to the Premium roster (Studio is Premium-only, no trial).
    for (const tool of PROFESSIONAL_TRIAL_TOOLS) {
      expect(tool.category === "Premium").toBe(true);
    }
    // Studio must never reappear in the trial roster: it is Premium-exclusive.
    expect(PROFESSIONAL_TRIAL_TOOLS.map((tool) => tool.href)).not.toContain("/studio");
    expect(getToolTier("/studio")).toBe("basic");
  });

  it("gates trial routes with TrialGate and keeps Studio on the Premium-only gate", () => {
    // TrialGate allows the free 5-file lifetime trial; PremiumGate allows none.
    for (const tool of PREMIUM_TOOLS) {
      const slug = tool.href.replace(/^\//, "");
      if (["chat-pdf", "pii-guardian", "recipes", "batch"].includes(slug)) continue;
      const source = readFileSync(join(process.cwd(), "src", "app", slug, "page.tsx"), "utf8");
      if (slug === "studio") {
        expect(source).toContain("PremiumGate");
        expect(source).not.toContain("TrialGate");
        expect(source).not.toContain('useUsage("studio")');
      } else {
        expect(source).toContain("TrialGate");
      }
    }
    // The standalone premium tools keep their custom gating (API-enforced).
    const chatSource = readFileSync(join(process.cwd(), "src", "app", "chat-pdf", "page.tsx"), "utf8");
    expect(chatSource).not.toContain("TrialGate");
  });
});
