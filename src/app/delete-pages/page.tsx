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

export default function DeletePagesPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ index: number; checked: boolean }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("delete-pages"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const count = pdf.getPageCount();
    setPages(Array.from({ length: count }, (_, i) => ({ index: i, checked: true })));
  }, []);

  const togglePage = (index: number) => {
    setPages((prev) => prev.map((p) => (p.index === index ? { ...p, checked: !p.checked } : p)));
  };

  const toggleAll = () => {
    const allChecked = pages.every((p) => p.checked);
    setPages((prev) => prev.map((p) => ({ ...p, checked: !allChecked })));
  };

  const runDelete = useCallback(async () => {
    if (!file || !pages.length) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const indicesToKeep = pages.filter((p) => p.checked).map((p) => p.index);

      if (indicesToKeep.length === 0) { setError("Select at least one page to keep."); setProcessing(false); return; }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, indicesToKeep);
      copiedPages.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filtered-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Delete Pages", pdfBytes.length);
      setSuccess(true);
    } catch { setError("Failed to delete pages."); }
    setProcessing(false);
  }, [file, pages]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runDelete();
  }, [runDelete]);

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
        name="Delete Pages from PDF - Free Online Tool"
        description="Remove unwanted pages from PDF documents online for free. Delete specific pages instantly."
        url="https://allaboutpdfediting.xyz/delete-pages"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Delete Pages from PDF</h1>
        <p className="text-[var(--muted)]">Remove unwanted pages from your PDF document.</p>
      </div>

      <ToolInfo name="Delete PDF Pages" description="Your file stays private. All processing happens locally in your browser using pdf-lib — no uploads, no servers. Select which pages to remove and download the result instantly." />

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
            <span className="text-5xl">🗑️</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB &middot; {pages.length} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {pages.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--foreground)]">Select pages to keep ({pages.filter((p) => p.checked).length} of {pages.length})</span>
              <button onClick={toggleAll} className="text-xs text-indigo-500 hover:underline">
                {pages.every((p) => p.checked) ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {pages.map((p) => (
                <button
                  key={p.index}
                  onClick={() => togglePage(p.index)}
                  className={`aspect-square rounded-xl text-sm font-medium border transition ${
                    p.checked
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:border-red-400 hover:text-red-500"
                  }`}
                >
                  {p.index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runDelete(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Deleting pages..." />

        {pages.length > 0 && (
          <>
            <button
              onClick={process}
              disabled={processing || pages.filter((p) => p.checked).length === pages.length || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Deleting pages...
                </span>
              ) : `Delete ${pages.length - pages.filter((p) => p.checked).length} page(s)`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB &amp; 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runDelete} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Pages deleted successfully!" details={`${pages.filter((p) => p.checked).length} of ${pages.length} pages kept`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Delete PDF Pages</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Remove unwanted pages from PDF files online for free. Select the pages you want to keep, and the tool creates a new PDF with only those pages. Perfect for removing blank pages, covers, or sections you don't need.</p>
          <p>All processing happens locally in your browser using pdf-lib — no uploads, no servers, complete privacy. Your original file is never transmitted or stored.</p>
          <p>Keywords: delete pages from PDF online free, remove PDF pages, PDF page remover, delete PDF pages without acrobat.</p>
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
