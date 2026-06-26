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
import { isPremium, checkFileSize, checkBatchCount } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

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
    for (const f of Array.from(list)) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
    }
    const countCheck = checkBatchCount(list.length);
    if (!countCheck.ok) { upsell.showUpsell("file-size"); return; }
    setFiles((prev) => [...prev, ...Array.from(list).filter((f) => f.type === "application/pdf")]);
  }, []);

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
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        if (!originalBytes.current) { originalBytes.current = bytes; }
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport(files[0]?.name || "merged.pdf", "Merge PDF", mergedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to merge PDFs. One or more files may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [files]);

  const merge = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runMerge();
  }, [runMerge]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${files[0]?.name || "restored.pdf"}`;
    a.click();
    URL.revokeObjectURL(url);
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
      <HowToJsonLd name="Merge PDF Files Online" description="Combine multiple PDF files into a single document" steps={[{name:"Upload PDFs",text:"Select two or more PDF files to merge"},{name:"Arrange order",text:"Drag and drop files to set the desired order"},{name:"Download merged PDF",text:"Download the combined single PDF document"}]} />
      <AiSummaryJsonLd name="Merge PDF" summary="Combine multiple PDF documents into one file with customizable page order" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file merging","Order customization","Drag-and-drop","Free processing","No file uploads"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Merge PDF</h1>
        <p className="text-[var(--muted)]">Combine multiple PDFs into one document. Drag to reorder.</p>
      </div>

      <ToolInfo
        name="Merge PDF"
        description="Your files stay on your device. Merging is done entirely in your browser using WebAssembly — no data uploaded, no servers involved. Select, reorder, and download your combined PDF instantly."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
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
            <span className="text-xs text-[var(--muted)]">Select multiple files at once</span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium text-[var(--muted)] mb-2">
              {files.length} file{files.length > 1 ? "s" : ""} selected — drag to reorder
              <button onClick={() => setFiles([])} className="ml-3 text-red-500 hover:text-red-600 text-xs">Clear all</button>
            </p>
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-[var(--muted)] w-6">{i + 1}.</span>
                  <span className="text-sm font-medium text-[var(--foreground)] truncate">{file.name}</span>
                  <span className="text-xs text-[var(--muted)] shrink-0">({formatBytes(file.size)})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Move up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1 text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30" title="Move down">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <button onClick={() => removeFile(i)} className="p-1 text-red-500 hover:text-red-600" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ProgressBar processing={processing} fileSize={files.reduce((s, f) => s + f.size, 0)} label="Merging PDFs..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runMerge(); }} />}

        <button
          onClick={merge}
          disabled={files.length < 2 || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Merging {files.length} files...
            </span>
          ) : `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}`}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
          </p>
        )}

        {files.length > 0 && files.length < 2 && (
          <p className="text-xs text-amber-500 mt-2 text-center">Select at least 2 PDF files to merge.</p>
        )}

        {error && <ErrorBanner message={error} onRetry={runMerge} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDFs merged!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Merge PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>With our merge PDF tool, you can combine PDF documents into a single file effortlessly, making it perfect for consolidating reports, invoices, scanned contracts, or any collection of related pages. Simply upload your PDFs, drag to reorder them, and click merge — the intuitive interface gives you full control over the final page sequence. The tool processes everything locally in your browser using pdf-lib, so your sensitive documents never touch a server. To merge PDF files online free, just select multiple PDFs, arrange them in the desired order, and download the combined result in seconds. This feature is especially useful for merging scanned documents that arrive as separate files, unifying chapter drafts into a complete manuscript, or creating comprehensive portfolios from individual pages. Everything stays private and secure.</p>
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
