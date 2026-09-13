import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { sanitizePdf } from "@/lib/pdfSanitize";

describe("PDF metadata sanitizer", () => {
  it("rebuilds pages without metadata, forms, annotations, or attachments", async () => {
    const source = await PDFDocument.create();
    const page = source.addPage([300, 200]);
    source.setTitle("Sensitive title");
    source.setAuthor("Sensitive author");
    const form = source.getForm();
    const field = form.createTextField("client_secret");
    field.setText("hidden form value");
    field.addToPage(page, { x: 30, y: 100, width: 150, height: 20 });
    await source.attach("data:text/plain;base64,cHJpdmF0ZSBhdHRhY2htZW50", "private.txt", {
      mimeType: "text/plain",
    });

    const sanitized = await sanitizePdf(await source.save());
    expect(sanitized.before.title).toBe("Sensitive title");
    expect(sanitized.before.author).toBe("Sensitive author");

    const result = await PDFDocument.load(sanitized.bytes, { updateMetadata: false });
    expect(result.getPageCount()).toBe(1);
    expect(result.getTitle()).toBeUndefined();
    expect(result.getAuthor()).toBeUndefined();
    expect(result.catalog.get(PDFName.of("AcroForm"))).toBeUndefined();
    expect(result.catalog.get(PDFName.of("Names"))).toBeUndefined();
    expect(result.getPage(0).node.get(PDFName.of("Annots"))).toBeUndefined();
  });
});
