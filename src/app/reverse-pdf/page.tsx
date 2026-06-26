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

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

export default function ReversePDFPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("reverse-pdf"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
  }, []);

  const runReverse = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const indices = pages.map((_, i) => i).reverse();
      const reversedDoc = await PDFDocument.create();
      const copiedPages = await reversedDoc.copyPages(pdfDoc, indices);
      copiedPages.forEach((p) => reversedDoc.addPage(p));
      const reversedBytes = await reversedDoc.save({ useObjectStreams: true });
      const blob = new Blob([reversedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reversed-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Reverse PDF Order", reversedBytes.length);
      setSuccess(true);
    } catch {
      setError("Failed to reverse page order.");
    }
    setProcessing(false);
  }, [file]);

  const reverse = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runReverse();
  }, [runReverse]);

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
        name="Reverse PDF Pages - Free Online Tool"
        description="Reverse PDF page order online for free. Flip the entire page sequence of any PDF instantly."
        url="https://allaboutpdfediting.xyz/reverse-pdf"
      />
      <HowToJsonLd name="Reverse PDF Page Order" description="Flip the entire page sequence of any PDF document" steps={[{name:"Upload PDF",text:"Select the PDF to reverse"},{name:"Reverse pages",text:"The tool reverses the entire page order"},{name:"Download reversed PDF",text:"Download the PDF with pages in reversed order"}]} />
      <AiSummaryJsonLd name="Reverse PDF Order" summary="Reverse the complete page sequence of PDF documents" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page reversal","Full document","Quick processing","Free tool","Client-side"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Reverse PDF Order</h1>
        <p className="text-[var(--muted)]">Flip the page order of any PDF file completely.</p>
      </div>

      <ToolInfo
        name="Reverse PDF Order"
        description="Your file stays private. All processing happens locally in your browser using pdf-lib — no uploads, no servers. Reverse the page sequence of your PDF and download instantly."
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
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🔄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF file</span>}
          </label>
        </div>

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runReverse(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Reversing pages..." />

        {file && (
          <>
            <button
              onClick={reverse}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Reversing Pages...
                </span>
              ) : "Reverse PDF Order"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runReverse} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Pages reversed successfully!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Reverse PDF Order</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Reverse the page order of any PDF file online for free. This tool takes all pages in your PDF and flips the sequence — the last page becomes first, and the first page becomes last. Useful when scanning documents from back to front, or when you need to reorganize a document that was assembled in reverse order.</p>
          <p>All processing happens in your browser using pdf-lib — no uploads, no servers, complete privacy. Upload your PDF and download the reversed version instantly.</p>
          <p>Keywords: reverse PDF pages online free, flip PDF order, invert page sequence, reverse PDF file, reorder PDF pages.</p>
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
