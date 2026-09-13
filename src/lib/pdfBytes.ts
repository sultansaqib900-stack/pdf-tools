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
  const sanitized = filename
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
  return sanitized || "document.pdf";
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

export function createPdfFile(bytes: PdfBinary, filename: string): File {
  return new File(
    [copyPdfBytes(bytes) as unknown as BlobPart],
    ensurePdfExtension(filename),
    { type: "application/pdf" },
  );
}
