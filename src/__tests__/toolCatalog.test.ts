import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  FREE_RECIPE_IDS,
  FREE_TOOL_COUNT,
  FREE_TOOLS,
  isFreeRecipe,
  isPremiumTool,
  PREMIUM_TOOL_COUNT,
  PREMIUM_TOOLS,
  TOOL_CATALOG,
} from "@/lib/toolCatalog";

const expectedPremiumRoster = [
  "PDF Studio Pipeline",
  "Batch Process",
  "PDF Automation Recipes",
  "Chat with PDF AI",
  "PII Guardian",
  "PDF Diff",
  "Search & Redact",
  "Bates Numbering",
  "Certificate Generator",
  "Form Data Extraction",
  "Bulk Rename",
  "Booklet Creator",
  "Split by Bookmarks",
  "Metadata Sanitizer",
].sort();

describe("canonical tool catalog", () => {
  it("contains exactly 52 unique routes split into 14 Premium and 38 free tools", () => {
    expect(TOOL_CATALOG).toHaveLength(52);
    expect(new Set(TOOL_CATALOG.map((tool) => tool.href)).size).toBe(52);
    expect(PREMIUM_TOOL_COUNT).toBe(14);
    expect(FREE_TOOL_COUNT).toBe(38);
    expect(PREMIUM_TOOLS).toHaveLength(14);
    expect(FREE_TOOLS).toHaveLength(38);
  });

  it("matches the professional Premium roster exactly", () => {
    expect(PREMIUM_TOOLS.map((tool) => tool.title).sort()).toEqual(expectedPremiumRoster);
  });

  it("keeps the four corrected acquisition tools free while Studio remains professional with its own timed trial", () => {
    for (const route of ["/pdf-to-audio", "/pdf-inverter", "/qr-stamp", "/vault"]) {
      expect(isPremiumTool(route)).toBe(false);
    }
    expect(isPremiumTool("/studio")).toBe(true);
  });

  it("does not retain route-level Premium gates on the four corrected free tools", () => {
    for (const route of ["pdf-to-audio", "pdf-inverter", "qr-stamp", "vault"]) {
      const source = readFileSync(join(process.cwd(), "src", "app", route, "page.tsx"), "utf8");
      expect(source).not.toContain("PremiumGate");
      expect(source).not.toContain('price="premium"');
    }
  });

  it("marks the three meaningful preview tools and two starter recipes", () => {
    for (const route of ["/chat-pdf", "/pii-guardian", "/recipes"]) {
      expect(PREMIUM_TOOLS.find((tool) => tool.href === route)?.hasFreePreview).toBe(true);
    }
    expect(FREE_RECIPE_IDS).toHaveLength(2);
    for (const id of FREE_RECIPE_IDS) expect(isFreeRecipe(id)).toBe(true);
    expect(isFreeRecipe("court_filing_standard")).toBe(false);
  });
});
