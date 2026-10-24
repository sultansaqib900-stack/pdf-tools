/**
 * Utilities shared by the browser PDF tools.
 *
 * PDF.js transfers typed-array buffers to its worker. Always pass it a copy;
 * passing application state directly can detach the original ArrayBuffer and
 * make the next pipeline operation fail with an empty/corrupt document.
 */

export type PdfBinary = Uint8Array | ArrayBuffer;

export function copyPdfBytes(input: PdfBinary): Uint8Array {
  if (input instanceof Uint8Array) {
    return input.slice();
  }
  return new Uint8Array(input.slice(0));
}

export function bytesToArrayBuffer(input: PdfBinary): ArrayBuffer {
  const copy = copyPdfBytes(input);
  return copy.buffer as ArrayBuffer;
}

export function isPdfFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  return (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    (mime === "" && /\.pdf$/i.test(file.name)) ||
    /\.pdf$/i.test(file.name)
  );
}

export function ensurePdfExtension(filename: string): string {
  const safe = filename.trim() || "document.pdf";
  return /\.pdf$/i.test(safe) ? safe : `${safe}.pdf`;
}

export function prefixPdfFilename(filename: string, prefix: string): string {
  const safe = ensurePdfExtension(filename);
  return `${prefix}${safe}`;
}

export function sanitizeDownloadFilename(filename: string): string {
  const base = (filename || "").split(/[/\\]/).pop() || "";
  const sanitized = base
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
  return sanitized || "document.pdf";
}

/**
 * Load a PDF for editing, transparently handling "permission-protected"
 * files. Many real-world PDFs (Word/Acrobat exports with printing or copy
 * restrictions, scanner output) carry an encryption dictionary with an EMPTY
 * user password — viewers open them seamlessly, but pdf-lib refuses them
 * outright ("Input document is encrypted"). Decrypting with the empty
 * password restores a plain PDF the tools can edit.
 *
 * Throws a friendly Error when the file needs a real password (pointing the
 * user at the Unlock tool) or when the file is otherwise unreadable.
 */
export async function loadPdfForEditing(
  input: PdfBinary,
  options?: Record<string, unknown>,
) {
  const bytes = input instanceof ArrayBuffer ? input : bytesToArrayBuffer(input);
  if (!bytes || bytes.byteLength === 0) {
    throw new Error("The selected file is empty (0 bytes). Please choose a valid PDF document.");
  }

  // Basic PDF structure validation (must contain %PDF- within initial header)
  const headerSlice = new Uint8Array(bytes.slice(0, Math.min(bytes.byteLength, 1024)));
  let headerStr = "";
  for (let i = 0; i < headerSlice.length; i++) {
    headerStr += String.fromCharCode(headerSlice[i]);
  }
  if (!headerStr.includes("%PDF-")) {
    throw new Error("The selected file does not appear to be a valid PDF document. Please verify the file.");
  }

  const { PDFDocument } = await import("pdf-lib");
  try {
    return await PDFDocument.load(bytes, options as never);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    if (!/encrypted/i.test(message)) {
      if (/corrupt|malformed|xref|trailer|offset/i.test(message)) {
        throw new Error("Could not parse this PDF. The document structure may be damaged or incomplete.");
      }
      throw cause;
    }

    let decrypted: Uint8Array;
    try {
      const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
      decrypted = await decryptPDF(copyPdfBytes(bytes), "");
    } catch {
      throw new Error(
        "This PDF is password-protected. Remove the password with the Unlock PDF tool first, then try again.",
      );
    }
    return PDFDocument.load(bytesToArrayBuffer(decrypted), options as never);
  }
}

/**
 * Validates output PDF bytes before allowing download or pipeline transfer.
 * Ensures that the document is non-empty, parseable, and has at least one page.
 */
export async function validatePdfOutput(
  input: PdfBinary,
): Promise<{ ok: boolean; pageCount: number; error?: string }> {
  try {
    const bytes = input instanceof ArrayBuffer ? input : bytesToArrayBuffer(input);
    if (!bytes || bytes.byteLength < 32) {
      return { ok: false, pageCount: 0, error: "Generated PDF is empty or incomplete." };
    }
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(bytes);
    const count = doc.getPageCount();
    if (count === 0) {
      return { ok: false, pageCount: 0, error: "Generated PDF contains no pages." };
    }
    return { ok: true, pageCount: count };
  } catch (e) {
    return {
      ok: false,
      pageCount: 0,
      error: e instanceof Error ? e.message : "Generated PDF could not be reopened.",
    };
  }
}

/**
 * Sanitizes errors into user-friendly, actionable messages.
 * Prevents internal stack traces, system paths, or cryptic WebAssembly tokens from leaking.
 */
export function formatPdfErrorMessage(error: unknown, defaultMessage = "Failed to process PDF."): string {
  if (!error) return defaultMessage;
  const raw = error instanceof Error ? error.message : String(error);

  if (/password|encrypted/i.test(raw)) {
    return "This PDF is password-protected. Please unlock it using the Unlock PDF tool before editing.";
  }
  if (/empty|no data|0 bytes/i.test(raw)) {
    return "The selected file is empty (0 bytes). Please select a valid PDF file.";
  }
  if (/not appear to be a valid PDF|not a valid PDF/i.test(raw)) {
    return "The selected file is not a valid PDF document.";
  }
  if (/corrupt|malformed|xref|trailer|offset|syntax/i.test(raw)) {
    return "This PDF file is damaged or incomplete. You can try the Re-save PDF tool to repair minor structure issues.";
  }
  if (/quota|limit exceeded|daily limit/i.test(raw)) {
    return "Usage limit reached for this session. Upgrade to Premium for unlimited access.";
  }
  if (/out of memory|allocation/i.test(raw)) {
    return "The document is too large to process in browser memory. Try processing fewer pages or smaller files.";
  }

  return raw.length > 200 ? defaultMessage : raw;
}

/**
 * Starts a browser download and revokes the temporary URL later. Revoking the
 * URL synchronously after click can cancel downloads in Safari/WebKit.
 */
export function downloadBytes(
  bytes: PdfBinary | Blob,
  filename: string,
  mimeType = "application/pdf",
): string {
  if (typeof document === "undefined") {
    throw new Error("Downloads are only available in a browser.");
  }

  const byteLength = bytes instanceof Blob
    ? bytes.size
    : (bytes instanceof Uint8Array ? bytes.byteLength : bytes.byteLength);

  if (byteLength === 0) {
    throw new Error("Cannot download an empty (0-byte) file.");
  }

  const blob = bytes instanceof Blob
    ? bytes
    : new Blob([copyPdfBytes(bytes) as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sanitizeDownloadFilename(filename);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

/**
 * Normalizes Unicode text to safe characters supported by StandardFonts (Helvetica/Times/Courier).
 * Standard PDF fonts only support WinAnsiEncoding (Windows-1252 subset).
 * Replaces smart quotes, typographic dashes, bullets, and ellipses with standard ASCII equivalents,
 * and converts unsupported characters to prevent runtime WinAnsi encoding crashes.
 */
export function sanitizeForStandardFont(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "*")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, "?");
}

export function createPdfFile(bytes: PdfBinary, filename: string): File {
  return new File(
    [copyPdfBytes(bytes) as unknown as BlobPart],
    ensurePdfExtension(filename),
    { type: "application/pdf" },
  );
}
