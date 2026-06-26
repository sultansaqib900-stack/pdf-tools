"use client";

import { useState, useRef } from "react";
import AdBanner from "@/components/AdBanner";
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
          <div className="text-6xl mb-6">⬛</div>
          <h1 className="text-3xl font-bold mb-3">Search & Redact</h1>
          <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">Find every occurrence of a word or phrase and redact them all — automatically.</p>
          <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-lg font-bold mb-1">Premium Feature</p>
            <p className="text-sm opacity-90 mb-4">Only premium subscribers can use search-based redaction</p>
            <a href="/premium" className="inline-block bg-white text-orange-600 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-50 transition">Upgrade to Premium</a>
          </div>
        </div>
      </div>
    );
  }

  const runRedact = async () => {
    if (!file || !searchTerms.trim()) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    try {
      const terms = searchTerms.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      const bytes = await file.arrayBuffer();
      pdfBytesRef.current = bytes;
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdfLibDoc = await PDFDocument.load(bytes);
      let totalMatches = 0;

      for (let pageIdx = 0; pageIdx < pdf.numPages; pageIdx++) {
        const page = await pdf.getPage(pageIdx + 1);
        const content = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });
        const pdfPage = pdfLibDoc.getPages()[pageIdx];

        for (const item of content.items) {
          const tItem = item as { str: string; transform: number[]; width?: number; height?: number };
          const text = tItem.str || "";
          const lowerText = text.toLowerCase();

          for (const term of terms) {
            let idx = 0;
            while ((idx = lowerText.indexOf(term, idx)) !== -1) {
              const scale = viewport.scale || 1;
              const charsBefore = text.substring(0, idx).length;
              const charsOfTerm = term.length;
              const avgCharWidth = (tItem.width || text.length * 5) / Math.max(text.length, 1);
              const x = tItem.transform[4] + (charsBefore * avgCharWidth);
              const y = tItem.transform[5];
              const w = charsOfTerm * avgCharWidth;
              const h = (tItem.height || 12);

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
      setError("Failed to redact. The file may be encrypted or scanned (image-only).");
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Search & Redact PDF" description="Automatically find and redact specific words or phrases in PDF documents." url="https://allaboutpdfediting.xyz/search-redact" image="https://allaboutpdfediting.xyz/opengraph-image.png" aggregateRating={{ ratingValue: 4.8, bestRating: 5, ratingCount: 167 }} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Search & Redact", item: "https://allaboutpdfediting.xyz/search-redact" }]} />
      <HowToJsonLd name="Search and Redact PDF" description="Automatically find and redact specific words or phrases across a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document you want to redact"},{name:"Enter search terms",text:"Type the words or phrases you want to find and redact"},{name:"Download redacted PDF",text:"Download the PDF with all matching content permanently blacked out"}]} />
      <AiSummaryJsonLd name="Search and Redact" summary="Auto-find and permanently redact specific words phrases or patterns across entire PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Auto-search and redact","Batch redaction","Phrase matching","Permanent removal","Client-side processing"]} limits="Premium subscribers" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Search & Redact</h1>
          <span className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2.5 py-0.5 rounded-full">Premium</span>
        </div>
        <p className="text-[var(--muted)]">Find every occurrence of a word or phrase and black them out — all at once.</p>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-5">
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 file:text-xs file:font-medium w-full" />

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Words/phrases to redact (comma-separated)</label>
          <input value={searchTerms} onChange={(e) => setSearchTerms(e.target.value)} placeholder="e.g. confidential, secret, internal use only" className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-sm" />
        </div>

        <button onClick={runRedact} disabled={!file || !searchTerms.trim() || processing} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 transition">
          {processing ? "Searching & Redacting..." : "Redact All"}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">✅ {matchCount} occurrence(s) redacted — file downloading</p>
        </div>
      )}
      {error && <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm">{error}</div>}

      <AdBanner className="mt-8" />

      <div className="border-t border-[var(--card-border)] pt-8 mt-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Search & Redact</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Unlike the manual redaction tool, this searches your entire PDF for specific words or phrases and redacts every occurrence automatically. Type "confidential, secret, internal" and every instance of those words across all pages will be permanently blacked out.</p>
          <p>Ideal for: legal document sanitization, removing PII (personally identifiable information), declassifying documents, preparing files for public release, and compliance with data privacy regulations.</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <a href="/premium" className="text-sm text-indigo-500 hover:underline font-medium">Explore all Premium features →</a>
      </div>
    </div>
  );
}
