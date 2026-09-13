import { describe, it, expect } from "vitest";
import { DEFAULT_RECIPES, executePdfRecipe, getActionLabel } from "@/lib/pdfRecipes";
import { PDFDocument, PDFName, StandardFonts } from "pdf-lib";
import { decryptPdf, getPdfEncryptionInfo } from "@/lib/pdfSecurity";

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

  it("applies configured rotation and watermark content", async () => {
    const document = await PDFDocument.create();
    document.addPage([300, 200]);
    const output = await executePdfRecipe(await document.save(), {
      id: "configured-actions",
      name: "Configured actions",
      description: "test",
      icon: "test",
      badge: "Test",
      category: "Custom",
      actions: [
        { type: "rotate", params: { degrees: 90 } },
        { type: "watermark", params: { text: "REVIEW COPY", opacity: 40 } },
      ],
    });
    const processed = await PDFDocument.load(output);
    expect(processed.getPage(0).getRotation().angle).toBe(90);
    const contents = processed.getPage(0).node.get(PDFName.of("Contents"));
    expect(contents).toBeDefined();
  });

  it("uses real AES-256 protection and enforces it as the final action", async () => {
    const document = await PDFDocument.create();
    document.addPage();
    const source = await document.save();
    const protectedOutput = await executePdfRecipe(source, {
      id: "protect",
      name: "Protect",
      description: "test",
      icon: "test",
      badge: "Test",
      category: "Custom",
      actions: [{ type: "protect" }],
    }, undefined, { password: "reader-secret" });

    expect((await getPdfEncryptionInfo(protectedOutput)).encrypted).toBe(true);
    expect((await PDFDocument.load(await decryptPdf(protectedOutput, "reader-secret"))).getPageCount()).toBe(1);

    await expect(executePdfRecipe(source, {
      id: "invalid-order",
      name: "Invalid order",
      description: "test",
      icon: "test",
      badge: "Test",
      category: "Custom",
      actions: [{ type: "protect" }, { type: "rotate", params: { degrees: 90 } }],
    }, undefined, { password: "secret" })).rejects.toThrow(/final/i);
  });
});
