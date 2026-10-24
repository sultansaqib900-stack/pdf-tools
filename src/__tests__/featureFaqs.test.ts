import { describe, it, expect } from "vitest";
import { relatedContent } from "@/lib/related-content";

describe("Audit Feature Descriptions and FAQs", () => {
  it("Edit PDF FAQ does not claim image insertion or freehand drawing", () => {
    const editFaqs = relatedContent["edit-pdf"].faqs;
    const imageFaq = editFaqs.find((f) => f.question.toLowerCase().includes("image"));
    expect(imageFaq).toBeDefined();
    expect(imageFaq?.answer).toContain("overlaying text boxes, rectangles, ellipses, and lines");
    expect(imageFaq?.answer).toContain("does not insert images");
  });

  it("PDF to Word FAQ accurately describes plain text extraction and layout limits", () => {
    const wordFaqs = relatedContent["pdf-to-word"].faqs;
    const formatFaq = wordFaqs.find((f) => f.question.toLowerCase().includes("formatting"));
    expect(formatFaq).toBeDefined();
    expect(formatFaq?.answer).toContain("Text content is extracted");
    expect(formatFaq?.answer).toContain("not reproduced");
  });

  it("Word to PDF FAQ clarifies modern .docx support and omitted images", () => {
    const w2pFaqs = relatedContent["word-to-pdf"].faqs;
    const formatFaq = w2pFaqs.find((f) => f.question.includes(".docx and .doc"));
    expect(formatFaq).toBeDefined();
    expect(formatFaq?.answer).toContain(".docx files");
    expect(formatFaq?.answer).toContain(".doc files are not supported in-browser");

    const imgFaq = w2pFaqs.find((f) => f.question.includes("images"));
    expect(imgFaq).toBeDefined();
    expect(imgFaq?.answer).toContain("omitted in the simplified output");
  });

  it("OCR PDF FAQ specifies English document recognition", () => {
    const ocrFaqs = relatedContent["ocr-pdf"].faqs;
    const langFaq = ocrFaqs.find((f) => f.question.toLowerCase().includes("languages"));
    expect(langFaq).toBeDefined();
    expect(langFaq?.answer).toContain("English document recognition");
  });

  it("PDF to Excel FAQ clarifies positional CSV extraction without spreadsheet styles", () => {
    const excelFaqs = relatedContent["pdf-to-excel"].faqs;
    const tableFaq = excelFaqs.find((f) => f.question.toLowerCase().includes("table formatting"));
    expect(tableFaq).toBeDefined();
    expect(tableFaq?.answer).toContain("CSV");
    expect(tableFaq?.answer).toContain("not stored in CSV format");
  });

  it("Batch Process FAQ specifies the four supported operations", () => {
    const batchFaqs = relatedContent["batch"].faqs;
    const opFaq = batchFaqs.find((f) => f.question.toLowerCase().includes("batch operations"));
    expect(opFaq).toBeDefined();
    expect(opFaq?.answer).toContain("Compress, Password Protect, Rotate 90°, and Watermark");
  });

  it("Certificate Generator FAQ mentions free trial limit and unlimited premium", () => {
    const certFaqs = relatedContent["certificate-generator"].faqs;
    const certCountFaq = certFaqs.find((f) => f.question.toLowerCase().includes("how many certificates"));
    expect(certCountFaq).toBeDefined();
    expect(certCountFaq?.answer).toContain("5-file lifetime professional trial");
    expect(certCountFaq?.answer).toContain("Premium members can generate unlimited");
  });
});

