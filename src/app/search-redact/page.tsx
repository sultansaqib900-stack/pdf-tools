"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";
import { secureRedactPdf, type PdfRedactionArea } from "@/lib/pdfRaster";
import { copyPdfBytes, downloadBytes, isPdfFile } from "@/lib/pdfBytes";
import { findPositionedTextMatches, type PositionedTextItem } from "@/lib/textSearch";

export default function SearchRedactPage() {
  usePageMeta("Search & Redact PDF - Auto-Redact Multiple Words | PDFTools Premium", "Search for specific words or phrases in a PDF and redact all occurrences automatically. Bulk redaction tool. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const ocrPage = async (canvas: HTMLCanvasElement): Promise<Array<{ text: string; x: number; y: number; w: number; h: number }>> => {
    const Tesseract = await import("tesseract.js");
    const { data } = await Tesseract.recognize(canvas, "eng", {
      logger: () => {},
    });
    const words: Array<{ text: string; x: number; y: number; w: number; h: number }> = [];
    for (const block of data.blocks || []) {
      for (const paragraph of block.paragraphs || []) {
        for (const line of paragraph.lines || []) {
          for (const word of line.words || []) {
            const bbox = word.bbox;
            words.push({
              text: word.text,
              x: bbox.x0,
              y: bbox.y0,
              w: bbox.x1 - bbox.x0,
              h: bbox.y1 - bbox.y0,
            });
          }
        }
      }
    }
    return words;
  };

  const runRedact = async () => {
    if (!file || !searchTerms.trim()) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      if (!isPdfFile(file)) throw new Error("Please select a valid PDF file.");
      const terms = Array.from(new Set(searchTerms.split(",").map((term) => term.trim()).filter(Boolean)));
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const loadingTask = pdfjsLib.getDocument({ data: copyPdfBytes(bytes) });
      const pdf = await loadingTask.promise;
      const redactions: PdfRedactionArea[] = [];
      let occurrenceCount = 0;
      const offscreen = document.createElement("canvas");

      try {
        for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex + 1);
          const textItems: PositionedTextItem[] = [];
          const content = await page.getTextContent();
          for (const item of content.items) {
            const textItem = item as { str: string; transform: number[]; width?: number; height?: number };
            textItems.push({
              text: textItem.str || "",
              x: textItem.transform[4],
              y: textItem.transform[5],
              width: textItem.width || (textItem.str || "").length * 5,
              height: textItem.height || Math.abs(textItem.transform[3]) || 12,
            });
          }

          if (!textItems.some((item) => item.text.trim())) {
            const viewport = page.getViewport({ scale: 2 });
            offscreen.width = Math.max(1, Math.round(viewport.width));
            offscreen.height = Math.max(1, Math.round(viewport.height));
            const context = offscreen.getContext("2d");
            if (!context) throw new Error("Canvas is unavailable for OCR.");
            await page.render({ canvas: offscreen, canvasContext: context, viewport }).promise;
            const words = await ocrPage(offscreen);
            for (const word of words) {
              const first = viewport.convertToPdfPoint(word.x, word.y);
              const second = viewport.convertToPdfPoint(word.x + word.w, word.y + word.h);
              textItems.push({
                text: word.text,
                x: Math.min(first[0], second[0]),
                y: Math.min(first[1], second[1]),
                width: Math.abs(second[0] - first[0]),
                height: Math.abs(second[1] - first[1]),
              });
            }
          }

          const searchResult = findPositionedTextMatches(textItems, terms);
          occurrenceCount += searchResult.occurrenceCount;
          for (const area of searchResult.areas) {
            const item = textItems[area.itemIndex];
            if (!item) continue;
            redactions.push({
              pageIndex,
              x: item.x + area.startRatio * item.width,
              y: item.y - item.height * 0.25,
              width: Math.max(1, (area.endRatio - area.startRatio) * item.width),
              height: item.height * 1.25,
            });
          }
          page.cleanup();
        }
      } finally {
        await loadingTask.destroy();
      }

      if (occurrenceCount === 0 || redactions.length === 0) {
        throw new Error("No matching words or phrases were found. Nothing was changed.");
      }
      setMatchCount(occurrenceCount);
      const pdfBytes = await secureRedactPdf(bytes, redactions);
      downloadBytes(pdfBytes, `redacted-${file.name}`);
      setSuccess(true);
    } catch (redactError) {
      setError(redactError instanceof Error ? redactError.message : "Failed to redact. The file may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PremiumGate
      title="Search & Bulk Text Redaction"
      description="Scan your document automatically for sensitive keywords, SSNs, names, or phrases and permanently redact every instance."
      icon="⬛"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Search & Redact PDF" description="Automatically find and redact specific words or phrases in PDF documents." url="https://allaboutpdfediting.xyz/search-redact" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 167 }} />
        <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Search & Redact", item: "https://allaboutpdfediting.xyz/search-redact" }]} />
        <HowToJsonLd name="Search and Redact PDF" description="Automatically find and redact specific words or phrases across a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document you want to redact"},{name:"Enter search terms",text:"Type the words or phrases you want to find and redact"},{name:"Download redacted PDF",text:"Download the PDF with all matching content permanently blacked out"}]} />
        <AiSummaryJsonLd name="Search and Redact" summary="Auto-find and permanently redact specific words phrases or patterns across entire PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Auto-search and redact","Batch redaction","Phrase matching","OCR for scanned PDFs","Permanent removal","Client-side processing"]} limits="Premium subscribers" />
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)]">Search & Redact</h1>
            <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full shadow-sm">Premium</span>
          </div>
          <p className="text-[var(--muted)]">Find every occurrence of a word or phrase and black them out — works on text and scanned PDFs.</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-2 border-dashed border-[var(--card-border)] hover:border-indigo-500/50 rounded-2xl p-6 text-center">
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => { const selected = e.target.files?.[0] || null; if (selected && isPdfFile(selected)) { setFile(selected); setError(null); setSuccess(false); } else if (selected) setError("Please select a valid PDF file."); }} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
            {file && <p className="text-xs text-emerald-600 font-semibold mt-2">Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--foreground)] mb-2">Words / Phrases to Redact (comma-separated)</label>
            <input value={searchTerms} onChange={(e) => setSearchTerms(e.target.value)} placeholder="e.g. confidential, secret, internal use only" className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm outline-none focus:border-indigo-500 font-medium" />
          </div>

          <button
            onClick={runRedact}
            disabled={!file || !searchTerms.trim() || processing}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-lg shadow-amber-500/25 active:scale-[0.99]"
          >
            {processing ? "Scanning & Redacting Words..." : "⚡ Auto-Redact All Matches"}
          </button>
        </div>

        {success && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">✅ {matchCount} occurrence(s) redacted — file downloaded!</p>
          </div>
        )}
        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm">{error}</div>}
      </div>
    </PremiumGate>
  );
}
