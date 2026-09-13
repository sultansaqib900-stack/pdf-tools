import { PDFDocument, PDFName } from "pdf-lib";
import { copyPdfBytes, type PdfBinary } from "./pdfBytes";

export interface PdfMetadataSnapshot {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
}

export interface SanitizedPdfResult {
  bytes: Uint8Array;
  before: PdfMetadataSnapshot;
}

/**
 * Rebuild a PDF from annotation-free pages in a fresh document.
 *
 * Copying only the page graph prevents catalog-level metadata, XMP, embedded
 * files, document JavaScript, forms, actions, and other unreferenced private
 * objects from being serialized into the result.
 */
export async function sanitizePdf(input: PdfBinary): Promise<SanitizedPdfResult> {
  const source = await PDFDocument.load(copyPdfBytes(input), { updateMetadata: false });
  const before: PdfMetadataSnapshot = {
    title: source.getTitle() || "(none)",
    author: source.getAuthor() || "(none)",
    subject: source.getSubject() || "(none)",
    creator: source.getCreator() || "(none)",
    producer: source.getProducer() || "(none)",
  };

  for (const page of source.getPages()) {
    page.node.delete(PDFName.of("Annots"));
    page.node.delete(PDFName.of("AA"));
  }

  const output = await PDFDocument.create({ updateMetadata: false });
  const copiedPages = await output.copyPages(source, source.getPageIndices());
  copiedPages.forEach((page) => output.addPage(page));
  output.context.trailerInfo.Info = undefined;

  return {
    bytes: await output.save({ useObjectStreams: true, updateFieldAppearances: false }),
    before,
  };
}
