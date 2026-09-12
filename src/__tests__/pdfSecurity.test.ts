import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { decryptPdf, encryptPdf, getPdfEncryptionInfo } from "@/lib/pdfSecurity";

async function makePdf(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const page = document.addPage([320, 200]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawText("confidential test document", { x: 24, y: 140, font, size: 14 });
  return document.save();
}

describe("PDF AES-256 security", () => {
  it("encrypts, identifies, and decrypts a real PDF", async () => {
    const source = await makePdf();
    const encrypted = await encryptPdf(source, "reader-secret", { ownerPassword: "owner-secret" });
    const encryption = await getPdfEncryptionInfo(encrypted);

    expect(encrypted).not.toEqual(source);
    expect(encryption.encrypted).toBe(true);
    expect(encryption.algorithm).toMatch(/AES-256/i);
    await expect(PDFDocument.load(encrypted)).rejects.toThrow();

    const decrypted = await decryptPdf(encrypted, "reader-secret");
    const opened = await PDFDocument.load(decrypted);
    expect(opened.getPageCount()).toBe(1);
  });

  it("rejects an incorrect password", async () => {
    const encrypted = await encryptPdf(await makePdf(), "reader-secret", { ownerPassword: "owner-secret" });
    await expect(decryptPdf(encrypted, "incorrect")).rejects.toThrow(/password|decrypt/i);
  });
});
