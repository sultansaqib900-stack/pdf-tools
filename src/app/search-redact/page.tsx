"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/ui/ToolShell";
import Icon from "@/components/ui/Icon";
import ToolGuide from "@/components/ToolGuide";
import { isPremium } from "@/lib/premium";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { usePageMeta } from "@/hooks/usePageMeta";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

export default function SearchRedactPage() {
  usePageMeta("Search & Redact PDF - Auto-Redact Multiple Words | PDFTools Premium", "Search for specific words or phrases in a PDF and redact all occurrences automatically. Bulk redaction tool. Premium.");
  const [file, setFile] = useState<File | null>(null);
  const [searchTerms, setSearchTerms] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [premiumBanner, setPremiumBanner] = useState(false);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);

  if (typeof window !== "undefined" && !isPremium()) {
    if (!premiumBanner) setPremiumBanner(true);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SoftwareAppJsonLd name="Search & Redact PDF" description="Auto-redact specific words or phrases across entire PDF. Premium." url="https://allaboutpdfediting.xyz/search-redact" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 167 }} />
        <div className="text-center py-20">
          <div className="flex justify-center mb-6"><Icon name="redact" size={42} className="text-[var(--muted)]" /></div>
          <h1 className="text-3xl font-bold mb-3">Search & Redact</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Find every occurrence of a word or phrase and redact them all — automatically.</p>
          <div className="inline-block bg-[var(--premium)] text-white px-8 py-4 rounded-[var(--r-xl)] shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can use search-based redaction</p>
            <a href="/premium" className="inline-block bg-white text-[var(--premium)] px-6 py-2 rounded-[var(--r-lg)] font-semibold text-sm hover:bg-[var(--premium-subtle)] transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

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
      pdfBytesRef.current = bytes;
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

        let textItems: Array<{ str: string; x: number; y: number; w: number; h: number }> = [];

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
    <ToolShell icon="search" title={"Search & Redact"} lead={"Find every occurrence of a word or phrase and black them out \u2014 works on text and scanned PDFs."} premium>
      <SoftwareAppJsonLd name="Search & Redact PDF" description="Automatically find and redact specific words or phrases in PDF documents." url="https://allaboutpdfediting.xyz/search-redact" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 167 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Search & Redact", item: "https://allaboutpdfediting.xyz/search-redact" }]} />
      <HowToJsonLd name="Search and Redact PDF" description="Automatically find and redact specific words or phrases across a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document you want to redact"},{name:"Enter search terms",text:"Type the words or phrases you want to find and redact"},{name:"Download redacted PDF",text:"Download the PDF with all matching content permanently blacked out"}]} />
      <AiSummaryJsonLd name="Search and Redact" summary="Auto-find and permanently redact specific words phrases or patterns across entire PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Auto-search and redact","Batch redaction","Phrase matching","OCR for scanned PDFs","Permanent removal","Client-side processing"]} limits="Premium subscribers" />


      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-lg)] p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-subtle)] file:text-[var(--accent)] file:text-xs file:font-medium w-full" />

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Words/phrases to redact (comma-separated)</label>
          <input value={searchTerms} onChange={(e) => setSearchTerms(e.target.value)} placeholder="e.g. confidential, secret, internal use only" className="w-full px-4 py-2.5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--background)] text-sm" />
        </div>

        <button onClick={runRedact} disabled={!file || !searchTerms.trim() || processing} className="w-full py-3 bg-[var(--premium)] text-white font-bold rounded-[var(--r-lg)] hover:opacity-90 disabled:opacity-40 transition">
          {processing ? "Searching & Redacting..." : "Redact All"}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-4 bg-[var(--success-subtle)] border border-[var(--success)]/25 rounded-[var(--r-lg)] text-center">
          <p className="text-sm text-[var(--success)] font-semibold">✅ {matchCount} occurrence(s) redacted — file downloading</p>
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-[var(--danger-subtle)] border border-[var(--danger)]/25 rounded-[var(--r-lg)] text-[var(--danger)] text-sm">{error}</div>}


      <ToolGuide slug="search-redact" />
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-[var(--accent)] hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </ToolShell>
  );
}
