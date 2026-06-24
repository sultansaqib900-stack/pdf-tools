"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

export default function SplitPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"range" | "all">("all");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("split"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const { PDFDocument: PDFDoc } = await import("pdf-lib");
    const pdf = await PDFDoc.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();
    setPageCount(count);
    setEndPage(count);
    setStartPage(1);
  }, []);

  const runSplit = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      if (mode === "all") {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const pdfBytes = await newPdf.save({ useObjectStreams: true });
          const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `page-${i + 1}-${file.name}`;
          a.click();
          URL.revokeObjectURL(url);
        }
        trackExport(file.name, "Split PDF", sourcePdf.getPageCount());
      } else {
        const s = Math.max(0, startPage - 1);
        const e = Math.min(sourcePdf.getPageCount() - 1, endPage - 1);
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, Array.from({ length: e - s + 1 }, (_, i) => s + i));
        pages.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pages-${startPage}-${endPage}-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        trackExport(file.name, "Split PDF", pdfBytes.byteLength);
      }
      setSuccess(true);
    } catch {
      setError("Failed to split PDF. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [file, mode, startPage, endPage]);

  const split = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runSplit();
  }, [runSplit]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Split PDF - Free Online PDF Tool"
        description="Split PDF files online for free. Extract pages from PDF documents instantly in your browser. No uploads."
        url="https://allaboutpdfediting.xyz/split"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Split PDF</h1>
        <p className="text-[var(--muted)]">Extract pages or split into separate files.</p>
      </div>

      <ToolInfo
        name="Split PDF"
        description="Your file stays private. Splitting happens locally in your browser using pdf-lib. Select pages, choose your range, and download — no uploads, no servers, complete privacy."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} page{pageCount > 1 ? "s" : ""}</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Splitting PDF..." />

        {pageCount > 0 && (
          <div className="mt-6 space-y-5">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "all"} onChange={() => setMode("all")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extract all pages</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "range"} onChange={() => setMode("range")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extract page range</span>
              </label>
            </div>

            {mode === "range" && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-lg">
                <label className="text-sm text-[var(--muted)]">From:</label>
                <input type="number" min={1} max={pageCount} value={startPage} onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))} className="w-20 px-3 py-1.5 border border-[var(--card-border)] rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)]" />
                <label className="text-sm text-[var(--muted)]">To:</label>
                <input type="number" min={1} max={pageCount} value={endPage} onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))} className="w-20 px-3 py-1.5 border border-[var(--card-border)] rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)]" />
                <span className="text-xs text-[var(--muted)]">(1–{pageCount})</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSplit(); }} />}

            <button
              onClick={split}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Splitting...
                </span>
              ) : mode === "all" ? `Split into ${pageCount} files` : `Extract pages ${startPage}–${endPage}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runSplit} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Split complete!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Split PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Need to split PDF online free? Our tool lets you extract PDF pages or split every page into individual files, giving you complete flexibility over how you manage your documents. Choose between extracting a specific page range or splitting the entire document into separate pages — the choice is yours. This is ideal when you need only certain sections from a large report, want to share pages one at a time, or need to reorganize content by removing specific pages. Processing happens entirely client-side using pdf-lib, meaning your document never leaves your browser. To extract PDF pages, simply upload your file, select your range, and download. Each extracted page preserves original quality and formatting, so you get clean, accurate results every time.</p>
        </div>
      </div>
      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
