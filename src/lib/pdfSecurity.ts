import { copyPdfBytes, type PdfBinary } from "./pdfBytes";

export interface PdfEncryptionOptions {
  ownerPassword?: string;
  allowPrinting?: boolean;
  allowModifying?: boolean;
  allowCopying?: boolean;
  allowAnnotating?: boolean;
  allowFillingForms?: boolean;
  allowExtraction?: boolean;
  allowAssembly?: boolean;
  allowHighQualityPrint?: boolean;
}

export interface PdfEncryptionInfo {
  encrypted: boolean;
  algorithm?: "AES-256" | "RC4";
  version?: number;
  revision?: number;
  keyLength?: number;
}

export async function encryptPdf(
  input: PdfBinary,
  password: string,
  options: PdfEncryptionOptions = {},
): Promise<Uint8Array> {
  if (!password) {
    throw new Error("Enter a password before protecting the PDF.");
  }

  const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
  return encryptPDF(copyPdfBytes(input), password, {
    algorithm: "AES-256",
    ownerPassword: options.ownerPassword || password,
    allowPrinting: options.allowPrinting ?? true,
    allowModifying: options.allowModifying ?? false,
    allowCopying: options.allowCopying ?? false,
    allowAnnotating: options.allowAnnotating ?? false,
    allowFillingForms: options.allowFillingForms ?? true,
    allowExtraction: options.allowExtraction ?? true,
    allowAssembly: options.allowAssembly ?? false,
    allowHighQualityPrint: options.allowHighQualityPrint ?? true,
  });
}

export async function decryptPdf(
  input: PdfBinary,
  password: string,
): Promise<Uint8Array> {
  if (!password) {
    throw new Error("Enter the PDF password.");
  }

  const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
  return decryptPDF(copyPdfBytes(input), password);
}

export async function getPdfEncryptionInfo(
  input: PdfBinary,
): Promise<PdfEncryptionInfo> {
  const { isEncrypted } = await import("@pdfsmaller/pdf-decrypt");
  return isEncrypted(copyPdfBytes(input));
}
