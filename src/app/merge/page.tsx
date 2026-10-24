"use client";

import { isPdfFile, loadPdfForEditing, downloadBytes, validatePdfOutput, formatPdfErrorMessage } from "@/lib/pdfBytes";
import { useState, useCallback, useEffect, useRef } from "react";
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
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("merge");

export default function MergePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("merge"); }, []);

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    for (const f of incoming) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const pdfs = incoming.filter((f) => isPdfFile(f));
    if (pdfs.length !== incoming.length) {
      setError("Some non-PDF files were skipped. Only valid PDF files are supported.");
    } else {
      setError(null);
    }
    setFiles((prev) => [...prev, ...pdfs]);
    setSuccess(false);
  }, [upsell]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const runMerge = useCallback(async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("trial-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        if (!originalBytes.current) { originalBytes.current = bytes; }
        const pdf = await loadPdfForEditing(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const validation = await validatePdfOutput(mergedBytes);
      if (!validation.ok) {
        throw new Error(validation.error || "Generated merged document is invalid.");
      }

      downloadBytes(mergedBytes, "merged.pdf");
      trackExport(files[0]?.name || "merged.pdf", "Merge PDF", mergedBytes.byteLength);
      setSuccess(true);
    } catch (mergeError) {
      setError(formatPdfErrorMessage(mergeError, "Failed to merge PDFs. One or more files may be corrupted or encrypted."));
    } finally {
      setProcessing(false);
    }
  }, [files, usage, upsell, trackExport]);

  const merge = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("trial-limit"); return; }
      setShowTimer(true);
      return;
    }
    runMerge();
  }, [usage, upsell, runMerge]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    downloadBytes(originalBytes.current, `original-${files[0]?.name || "restored.pdf"}`);
  }, [files]);

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const moveDown = (i: number) => {
    if (i === files.length - 1) return;
    setFiles((prev) => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Merge PDF - Free Online PDF Tool"
        description="Merge multiple PDFs into one document online for free. Combine PDF files instantly in your browser. No uploads required."
        url="https://allaboutpdfediting.xyz/merge"
      />
      <HowToJsonLd name="Merge PDF Files Online" description="Combine multiple PDF files into a single document" steps={[{name:"Upload PDFs",text:"Select two or more PDF files to merge"},{name:"Arrange order",text:"Use the arrow controls to set the desired order"},{name:"Download merged PDF",text:"Download the combined single PDF document"}]} />
      <Breadcrumbs items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Merge PDF", item: "https://allaboutpdfediting.xyz/merge" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Merge PDF" summary="Combine multiple PDF documents into one file with customizable page order" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file merging","Order customization","Drag-and-drop","Free processing","No file uploads"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Merge PDF</h1>
        <p className="text-[var(--muted)]">Combine multiple PDFs into one document. Use the arrow controls to reorder.</p>
      </div>

      <ToolInfo
        name="Merge PDF"
        description="Your files stay on your device. Merging is done entirely in your browser using pdf-lib — no data uploaded, no servers involved. Select, reorder, and download your combined PDF instantly."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} tier={usage.tier} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📄</span>
            <span className="text-indigo-500 font-medium hover:underline">Click to select or drag & drop PDFs</span>
            <span className="text-xs text-[var(--muted)]">Select multiple files at once · Max {isPremium() ? "100MB" : "10MB"} per file</span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-[var(--muted)] mb-2">
              <span>{files.length} file{files.length > 1 ? "s" : ""} selected — use arrows to reorder</span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-red-500 hover:text-red-600 text-xs font-semibold"
              >
                Clear all
              </button>
            </div>
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-[var(--muted)] w-6">{i + 1}.</span>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">{file.name}</span>
                  <span className="text-xs text-[var(--muted)] shrink-0">({formatBytes(file.size)})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Move up">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Move down">↓</button>
                  <button onClick={() => removeFile(i)} className="p-1 text-red-500 hover:text-red-600 text-xs ml-2" title="Remove">✕</button>
                </div>
              </div>
            ))}

            <ProgressBar processing={processing} label="Merging PDFs..." />

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runMerge(); }} />}

            <button
              onClick={merge}
              disabled={files.length < 2 || processing || showTimer}
              className="mt-4 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? "Merging..." : files.length < 2 ? "Select at least 2 files to merge" : `Merge ${files.length} PDFs`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB files & batch</a>
              </p>
            )}

            {error && <ErrorBanner message={error} onRetry={runMerge} onDismiss={() => setError(null)} />}

            <SuccessAnimation show={success} message="PDFs merged successfully!" onRestore={restoreOriginal} />
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Merge PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Combine multiple PDF documents into a single organized file in seconds. Order your documents using the up/down controls before merging. Everything runs client-side in your browser, keeping your documents private and secure.</p>
        </div>
      </div>
      <RelatedContent slug="merge" />

      <UseCaseLinks toolSlug="merge" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
