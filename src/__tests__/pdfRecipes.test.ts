import { describe, it, expect } from "vitest";
import { DEFAULT_RECIPES, executePdfRecipe, getActionLabel } from "@/lib/pdfRecipes";
import { PDFDocument, StandardFonts } from "pdf-lib";

describe("PDF Recipes & Macro Automations", () => {
  it("should have pre-configured industry recipes", () => {
    expect(DEFAULT_RECIPES.length).toBeGreaterThanOrEqual(4);
    const courtFiling = DEFAULT_RECIPES.find((r) => r.id === "court_filing_standard");
    expect(courtFiling).toBeDefined();
    expect(courtFiling?.actions.length).toBeGreaterThanOrEqual(3);
  });

  it("should return human-readable action labels", () => {
    expect(getActionLabel("pii_redact")).toBe("Scan & Redact PII");
    expect(getActionLabel("bates_number")).toBe("Stamp Bates Numbers");
    expect(getActionLabel("watermark")).toBe("Apply Watermark");
  });

  it("should execute multi-step macro on a PDF document", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([500, 500]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("Initial legal document text", { x: 50, y: 400, size: 12, font });
    const bytes = await doc.save();

    const academicRecipe = DEFAULT_RECIPES.find((r) => r.id === "academic_grant_submission")!;
    const outputBytes = await executePdfRecipe(bytes, academicRecipe);

    expect(outputBytes).toBeDefined();
    expect(outputBytes.length).toBeGreaterThan(0);
  });
});
