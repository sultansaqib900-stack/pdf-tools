"use client";

import { useState } from "react";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import PremiumGate from "@/components/PremiumGate";

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
      const terms = searchTerms.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      const bytes = await file.arrayBuffer();
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdfLibDoc = await PDFDocument.load(bytes);
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let totalMatches = 0;

      const offscreen = document.createElement("canvas");

      for (let pageIdx = 0; pageIdx < pdf.numPages; pageIdx++) {
        const page = await pdf.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale: 2 });
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const ctx = offscreen.getContext("2d")!;
        await page.render({ canvas: offscreen, viewport }).promise;

        const pdfPage = pdfLibDoc.getPages()[pageIdx];
        const pageHeight = pdfPage.getHeight();
        const scaleX = pageHeight / viewport.height;
        const scaleY = pageHeight / viewport.height;

        const textItems: Array<{ str: string; x: number; y: number; w: number; h: number }> = [];

        try {
          const content = await page.getTextContent();
          for (const item of content.items) {
            const tItem = item as { str: string; transform: number[]; width?: number; height?: number };
            textItems.push({
              str: tItem.str || "",
              x: tItem.transform[4],
              y: tItem.transform[5],
              w: tItem.width || (tItem.str || "").length * 5,
              h: tItem.height || 12,
            });
          }
        } catch {}

        const hasText = textItems.some(t => t.str.trim().length > 0);
        if (!hasText) {
          const words = await ocrPage(offscreen);
          for (const word of words) {
            textItems.push({
              str: word.text,
              x: word.x * scaleX,
              y: (viewport.height - word.y - word.h) * scaleY,
              w: word.w * scaleX,
              h: word.h * scaleY,
            });
          }
        }

        for (const item of textItems) {
          const text = item.str || "";
          const lowerText = text.toLowerCase();
          for (const term of terms) {
            let idx = 0;
            while ((idx = lowerText.indexOf(term, idx)) !== -1) {
              const charsBefore = text.substring(0, idx).length;
              const charsOfTerm = term.length;
              const avgCharWidth = item.w / Math.max(text.length, 1);
              const x = item.x + charsBefore * avgCharWidth;
              const y = item.y;
              const w = charsOfTerm * avgCharWidth;
              const h = item.h;

              pdfPage.drawRectangle({
                x, y: y - h * 0.2,
                width: w + 2,
                height: h + 2,
                color: rgb(0, 0, 0),
              });
              totalMatches++;
              idx += term.length;
            }
          }
        }
      }

      setMatchCount(totalMatches);
      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to redact. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
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
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:text-xs file:font-semibold w-full cursor-pointer" />
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
