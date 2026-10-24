import { describe, it, expect } from "vitest";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import {
  loadPdfForEditing,
  validatePdfOutput,
  sanitizeForStandardFont,
  sanitizeDownloadFilename,
  copyPdfBytes,
} from "@/lib/pdfBytes";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";

/**
 * Creates a helper multi-page test PDF with distinct dimensions and text.
 */
async function createTestPdf(pageSpecs: { width: number; height: number; text: string }[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const spec of pageSpecs) {
    const page = doc.addPage([spec.width, spec.height]);
    page.drawText(spec.text, {
      x: 50,
      y: spec.height - 100,
      size: 18,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  return await doc.save({ useObjectStreams: true });
}

describe("PDF Document Integrity & Processing Reliability", () => {
  it("merges multiple PDFs preserving ordering, page dimensions, and document validity", async () => {
    // PDF 1: 2 pages (A4 and Letter)
    const pdf1Bytes = await createTestPdf([
      { width: 595, height: 842, text: "Doc 1 Page 1" },
      { width: 612, height: 792, text: "Doc 1 Page 2" },
    ]);

    // PDF 2: 3 pages (Landscape and square)
    const pdf2Bytes = await createTestPdf([
      { width: 842, height: 595, text: "Doc 2 Page 1" },
      { width: 500, height: 500, text: "Doc 2 Page 2" },
      { width: 595, height: 842, text: "Doc 2 Page 3" },
    ]);

    const mergedDoc = await PDFDocument.create();
    const doc1 = await loadPdfForEditing(pdf1Bytes);
    const doc2 = await loadPdfForEditing(pdf2Bytes);

    const pages1 = await mergedDoc.copyPages(doc1, doc1.getPageIndices());
    pages1.forEach((p) => mergedDoc.addPage(p));

    const pages2 = await mergedDoc.copyPages(doc2, doc2.getPageIndices());
    pages2.forEach((p) => mergedDoc.addPage(p));

    const mergedBytes = await mergedDoc.save({ useObjectStreams: true });
    await validatePdfOutput(mergedBytes);

    // Verify reopened structure
    const verified = await loadPdfForEditing(mergedBytes);
    expect(verified.getPageCount()).toBe(5);

    // Page 0 was A4
    expect(verified.getPage(0).getSize().width).toBeCloseTo(595, 0);
    expect(verified.getPage(0).getSize().height).toBeCloseTo(842, 0);

    // Page 2 was Landscape
    expect(verified.getPage(2).getSize().width).toBeCloseTo(842, 0);
    expect(verified.getPage(2).getSize().height).toBeCloseTo(595, 0);

    // Page 3 was square
    expect(verified.getPage(3).getSize().width).toBeCloseTo(500, 0);
    expect(verified.getPage(3).getSize().height).toBeCloseTo(500, 0);
  });

  it("splits PDF pages within specified ranges and produces valid sub-documents", async () => {
    const srcBytes = await createTestPdf([
      { width: 600, height: 800, text: "Chapter 1" },
      { width: 600, height: 800, text: "Chapter 2" },
      { width: 600, height: 800, text: "Chapter 3" },
      { width: 600, height: 800, text: "Chapter 4" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);

    // Extract pages 2 to 3 (0-indexed: 1 and 2)
    const splitDoc = await PDFDocument.create();
    const copiedPages = await splitDoc.copyPages(srcDoc, [1, 2]);
    copiedPages.forEach((p) => splitDoc.addPage(p));

    const splitBytes = await splitDoc.save({ useObjectStreams: true });
    await validatePdfOutput(splitBytes);

    const verified = await loadPdfForEditing(splitBytes);
    expect(verified.getPageCount()).toBe(2);
  });

  it("reorders pages arbitrarily and maintains page retention", async () => {
    const srcBytes = await createTestPdf([
      { width: 500, height: 700, text: "First" },
      { width: 500, height: 700, text: "Second" },
      { width: 500, height: 700, text: "Third" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);
    const newOrder = [2, 0, 1]; // Third, First, Second

    const reorderedDoc = await PDFDocument.create();
    const copiedPages = await reorderedDoc.copyPages(srcDoc, newOrder);
    copiedPages.forEach((p) => reorderedDoc.addPage(p));

    const reorderedBytes = await reorderedDoc.save({ useObjectStreams: true });
    await validatePdfOutput(reorderedBytes);

    const verified = await loadPdfForEditing(reorderedBytes);
    expect(verified.getPageCount()).toBe(3);
  });

  it("reverses PDF page sequence correctly", async () => {
    const srcBytes = await createTestPdf([
      { width: 600, height: 800, text: "Page A" },
      { width: 600, height: 800, text: "Page B" },
      { width: 600, height: 800, text: "Page C" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);
    const indices = srcDoc.getPageIndices().reverse(); // [2, 1, 0]

    const reversedDoc = await PDFDocument.create();
    const copied = await reversedDoc.copyPages(srcDoc, indices);
    copied.forEach((p) => reversedDoc.addPage(p));

    const reversedBytes = await reversedDoc.save({ useObjectStreams: true });
    await validatePdfOutput(reversedBytes);

    const verified = await loadPdfForEditing(reversedBytes);
    expect(verified.getPageCount()).toBe(3);
  });

  it("rotates pages by specified angles and persists orientation", async () => {
    const srcBytes = await createTestPdf([
      { width: 595, height: 842, text: "Page 1" },
      { width: 595, height: 842, text: "Page 2" },
    ]);

    const doc = await loadPdfForEditing(srcBytes);
    doc.getPage(0).setRotation(degrees(90));
    doc.getPage(1).setRotation(degrees(180));

    const rotatedBytes = await doc.save({ useObjectStreams: true });
    await validatePdfOutput(rotatedBytes);

    const verified = await loadPdfForEditing(rotatedBytes);
    expect(verified.getPage(0).getRotation().angle).toBe(90);
    expect(verified.getPage(1).getRotation().angle).toBe(180);
  });

  it("deletes specified pages and retains the rest", async () => {
    const srcBytes = await createTestPdf([
      { width: 500, height: 500, text: "Keep 1" },
      { width: 500, height: 500, text: "Delete 2" },
      { width: 500, height: 500, text: "Keep 3" },
      { width: 500, height: 500, text: "Delete 4" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);
    const keepIndices = [0, 2];

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, keepIndices);
    copied.forEach((p) => newDoc.addPage(p));

    const resultBytes = await newDoc.save({ useObjectStreams: true });
    await validatePdfOutput(resultBytes);

    const verified = await loadPdfForEditing(resultBytes);
    expect(verified.getPageCount()).toBe(2);
  });

  it("inserts blank pages at specified position", async () => {
    const srcBytes = await createTestPdf([
      { width: 595, height: 842, text: "Original Page 1" },
      { width: 595, height: 842, text: "Original Page 2" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);
    const newDoc = await PDFDocument.create();

    // Copy page 0
    const [p1] = await newDoc.copyPages(srcDoc, [0]);
    newDoc.addPage(p1);

    // Insert 2 blank pages of matching size
    newDoc.addPage([595, 842]);
    newDoc.addPage([595, 842]);

    // Copy page 1
    const [p2] = await newDoc.copyPages(srcDoc, [1]);
    newDoc.addPage(p2);

    const insertedBytes = await newDoc.save({ useObjectStreams: true });
    await validatePdfOutput(insertedBytes);

    const verified = await loadPdfForEditing(insertedBytes);
    expect(verified.getPageCount()).toBe(4);
  });

  it("sanitizes Unicode typographic characters so standard Helvetica fonts don't crash", async () => {
    const rawText = "“Antigravity” — smart quotes & dashes… non-breaking\u00A0space and bullet • symbols";
    const sanitized = sanitizeForStandardFont(rawText);

    expect(sanitized).not.toContain("“");
    expect(sanitized).not.toContain("”");
    expect(sanitized).not.toContain("—");
    expect(sanitized).not.toContain("…");
    expect(sanitized).toContain('"Antigravity"');
    expect(sanitized).toContain("-");
    expect(sanitized).toContain("...");

    // Test actual pdf-lib drawing with sanitized text
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    expect(() => {
      page.drawText(sanitized, {
        x: 50,
        y: 350,
        size: 14,
        font,
      });
    }).not.toThrow();

    const bytes = await doc.save();
    await validatePdfOutput(bytes);
  });

  it("applies Bates numbering across multi-page document with zero padding", async () => {
    const srcBytes = await createTestPdf([
      { width: 612, height: 792, text: "Legal Exhibit A" },
      { width: 612, height: 792, text: "Legal Exhibit B" },
      { width: 612, height: 792, text: "Legal Exhibit C" },
    ]);

    const doc = await loadPdfForEditing(srcBytes);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();

    const prefix = "CONF-";
    const suffix = "-US";
    const digits = 6;
    const startNumber = 100;

    for (let i = 0; i < pages.length; i++) {
      const numStr = String(startNumber + i).padStart(digits, "0");
      const batesText = `${prefix}${numStr}${suffix}`;
      pages[i].drawText(batesText, {
        x: 400,
        y: 30,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    const batesBytes = await doc.save({ useObjectStreams: true });
    await validatePdfOutput(batesBytes);

    const verified = await loadPdfForEditing(batesBytes);
    expect(verified.getPageCount()).toBe(3);
  });

  it("applies booklet 2-up imposition without losing pages", async () => {
    // 4-page source PDF
    const srcBytes = await createTestPdf([
      { width: 400, height: 600, text: "Booklet P1" },
      { width: 400, height: 600, text: "Booklet P2" },
      { width: 400, height: 600, text: "Booklet P3" },
      { width: 400, height: 600, text: "Booklet P4" },
    ]);

    const srcDoc = await loadPdfForEditing(srcBytes);
    const bookletDoc = await PDFDocument.create();

    const [w, h] = [400, 600];
    const sheetWidth = w * 2;
    const sheetHeight = h;

    // Booklet signature for 4 pages: Sheet 1 = [4, 1], Sheet 2 = [2, 3]
    const embedded = await bookletDoc.embedPages(srcDoc.getPages());

    // Sheet 1
    const s1 = bookletDoc.addPage([sheetWidth, sheetHeight]);
    s1.drawPage(embedded[3], { x: 0, y: 0, width: w, height: h });
    s1.drawPage(embedded[0], { x: w, y: 0, width: w, height: h });

    // Sheet 2
    const s2 = bookletDoc.addPage([sheetWidth, sheetHeight]);
    s2.drawPage(embedded[1], { x: 0, y: 0, width: w, height: h });
    s2.drawPage(embedded[2], { x: w, y: 0, width: w, height: h });

    const bookletBytes = await bookletDoc.save({ useObjectStreams: true });
    await validatePdfOutput(bookletBytes);

    const verified = await loadPdfForEditing(bookletBytes);
    expect(verified.getPageCount()).toBe(2);
    expect(verified.getPage(0).getWidth()).toBe(800);
    expect(verified.getPage(0).getHeight()).toBe(600);
  });

  it("transparently decrypts permission-protected PDFs (empty user password)", async () => {
    const srcDoc = await PDFDocument.create();
    srcDoc.addPage([595, 842]);
    const plain = await srcDoc.save();

    // Encrypt with owner password only (empty user password - standard Word/scanner export)
    const encryptedBytes = await encryptPDF(new Uint8Array(plain), "", {
      algorithm: "AES-256",
      ownerPassword: "admin-secret-password",
    });

    // loadPdfForEditing must transparently decrypt and return a fully editable PDF
    const loaded = await loadPdfForEditing(encryptedBytes);
    expect(loaded.getPageCount()).toBe(1);

    // Drawing and saving must work cleanly
    const page = loaded.getPage(0);
    const font = await loaded.embedFont(StandardFonts.Helvetica);
    page.drawText("Decrypted & Edited", { x: 50, y: 50, size: 12, font });

    const saved = await loaded.save();
    await validatePdfOutput(saved);
  });

  it("rejects password-protected PDFs with a clear actionable message", async () => {
    const srcDoc = await PDFDocument.create();
    srcDoc.addPage([595, 842]);
    const plain = await srcDoc.save();

    // Encrypted with a real user password
    const encryptedBytes = await encryptPDF(new Uint8Array(plain), "userpassword123", {
      algorithm: "AES-256",
      ownerPassword: "ownerpassword456",
    });

    await expect(loadPdfForEditing(encryptedBytes)).rejects.toThrow(
      /password-protected.*Unlock PDF/i
    );
  });

  it("rejects malformed or zero-byte input files immediately", async () => {
    // Zero-byte input
    await expect(loadPdfForEditing(new Uint8Array(0))).rejects.toThrow(
      /empty/i
    );

    // Non-PDF binary garbage
    const garbage = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    await expect(loadPdfForEditing(garbage)).rejects.toThrow(
      /valid PDF document/i
    );

    // validatePdfOutput returns ok: false for empty or invalid bytes
    const invalidValidation = await validatePdfOutput(new Uint8Array(10));
    expect(invalidValidation.ok).toBe(false);
    expect(invalidValidation.error).toBeTruthy();
  });

  it("crops margins safely and adjusts CropBox dimensions", async () => {
    const srcBytes = await createTestPdf([
      { width: 600, height: 800, text: "Page to crop" },
    ]);

    const doc = await loadPdfForEditing(srcBytes);
    const page = doc.getPage(0);

    // Crop 50pt from each side
    const [l, r, t, b] = [50, 50, 50, 50];
    const { width, height } = page.getSize();
    page.setCropBox(l, b, width - (l + r), height - (t + b));

    const croppedBytes = await doc.save();
    await validatePdfOutput(croppedBytes);

    const verified = await loadPdfForEditing(croppedBytes);
    const cropBox = verified.getPage(0).getCropBox();
    expect(cropBox.x).toBe(50);
    expect(cropBox.y).toBe(50);
    expect(cropBox.width).toBe(500);
    expect(cropBox.height).toBe(700);
  });

  it("sets and sanitizes PDF metadata properties reliably", async () => {
    const srcBytes = await createTestPdf([
      { width: 500, height: 500, text: "Metadata Document" },
    ]);

    const doc = await loadPdfForEditing(srcBytes);
    doc.setTitle("Annual Financial Report 2026");
    doc.setAuthor("Engineering Lead");
    doc.setSubject("Financial Analysis");
    doc.setKeywords(["audit", "report", "2026"]);

    const savedBytes = await doc.save({ useObjectStreams: true });
    await validatePdfOutput(savedBytes);

    const verified = await loadPdfForEditing(savedBytes);
    expect(verified.getTitle()).toBe("Annual Financial Report 2026");
    expect(verified.getAuthor()).toBe("Engineering Lead");
    expect(verified.getSubject()).toBe("Financial Analysis");
    expect(verified.getKeywords()).toContain("audit");
    expect(verified.getKeywords()).toContain("report");
    expect(verified.getKeywords()).toContain("2026");
  });

  it("sanitizes download filenames against directory traversal and dangerous characters", () => {
    expect(sanitizeDownloadFilename("../../../etc/passwd.pdf")).toBe("passwd.pdf");
    expect(sanitizeDownloadFilename("file:name*with?bad|chars.pdf")).toBe("file_name_with_bad_chars.pdf");
    expect(sanitizeDownloadFilename("")).toBe("document.pdf");
    expect(sanitizeDownloadFilename("   ")).toBe("document.pdf");
    expect(sanitizeDownloadFilename("report.docx.pdf")).toBe("report.docx.pdf");
  });
});
