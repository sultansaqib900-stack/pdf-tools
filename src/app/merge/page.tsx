"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import ToolShell from "@/components/ui/ToolShell";
import DropZone from "@/components/ui/DropZone";
import Icon from "@/components/ui/Icon";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
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
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runMerge();
    }, [usage, upsell, runMerge])

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
    <ToolShell
      icon="merge"
      title="Merge PDF"
      lead="Combine several PDFs into one document and set the page order. Nothing is uploaded."
    >
      <SoftwareAppJsonLd
        name="Merge PDF - Free Online PDF Tool"
        description="Merge multiple PDFs into one document online for free. Combine PDF files instantly in your browser. No uploads required."
        url="https://allaboutpdfediting.xyz/merge"
      />
      <HowToJsonLd name="Merge PDF Files Online" description="Combine multiple PDF files into a single document" steps={[{name:"Upload PDFs",text:"Select two or more PDF files to merge"},{name:"Arrange order",text:"Drag and drop files to set the desired order"},{name:"Download merged PDF",text:"Download the combined single PDF document"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Merge PDF", item: "https://allaboutpdfediting.xyz/merge" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Merge PDF" summary="Combine multiple PDF documents into one file with customizable page order" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file merging","Order customization","Drag-and-drop","Free processing","No file uploads"]} limits="Files up to 10MB" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <DropZone
          multiple
          onFiles={(list) => handleFiles(list as unknown as FileList)}
          label="Drop PDFs here, or click to browse"
          hint="Select two or more files"
        />

        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.8125rem] text-[var(--muted)]">
                {files.length} file{files.length > 1 ? "s" : ""} &middot; drag order with the arrows
              </p>
              <button onClick={() => setFiles([])} className="text-[0.75rem] text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                Clear all
              </button>
            </div>
            <ul className="space-y-1.5">
              {files.map((file, i) => (
                <li key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-md)] border border-[var(--border)] bg-[var(--surface)]">
                  <span className="w-5 shrink-0 text-[0.75rem] tabular-nums text-[var(--muted)]">{i + 1}</span>
                  <span className="flex-1 min-w-0 truncate text-[0.8125rem] text-[var(--foreground)]">{file.name}</span>
                  <span className="shrink-0 text-[0.75rem] tabular-nums text-[var(--muted)]">{formatBytes(file.size)}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i === 0} aria-label="Move up"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                      <Icon name="chevronDown" size={14} className="rotate-180" />
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === files.length - 1} aria-label="Move down"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                      <Icon name="chevronDown" size={14} />
                    </button>
                    <button onClick={() => removeFile(i)} aria-label="Remove"
                      className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-hover)] transition-colors">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ProgressBar processing={processing} fileSize={files.reduce((s, f) => s + f.size, 0)} label="Merging PDFs..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runMerge(); }} />}

        <button
          onClick={merge}
          disabled={files.length < 2 || processing || showTimer}
          className="btn btn-primary btn-lg w-full mt-4"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Merging {files.length} files
            </>
          ) : files.length > 0 ? `Merge ${files.length} PDF${files.length !== 1 ? "s" : ""}` : "Merge PDFs"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-[0.75rem] text-[var(--muted)]">
            Free tier is limited to 10 MB.{" "}
            <a href="/premium" className="font-medium text-[var(--accent)] hover:underline">Upgrade for 100 MB and batch processing</a>
          </p>
        )}

        {files.length > 0 && files.length < 2 && (
          <p className="mt-2 text-center text-[0.75rem] text-[var(--muted)]">Select at least two PDFs to merge.</p>
        )}

        {error && <ErrorBanner message={error} onRetry={runMerge} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDFs merged!" onRestore={restoreOriginal} />
      </div>

      <section className="mt-10 pt-8 border-t border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">About this tool</h2>
        <div className="text-[0.875rem] leading-relaxed text-[var(--muted-strong)] space-y-3">
          <p>With our merge PDF tool, you can combine PDF documents into a single file effortlessly, making it perfect for consolidating reports, invoices, scanned contracts, or any collection of related pages. Simply upload your PDFs, drag to reorder them, and click merge — the intuitive interface gives you full control over the final page sequence. The tool processes everything locally in your browser using pdf-lib, so your sensitive documents never touch a server. To merge PDF files online free, just select multiple PDFs, arrange them in the desired order, and download the combined result in seconds. This feature is especially useful for merging scanned documents that arrive as separate files, unifying chapter drafts into a complete manuscript, or creating comprehensive portfolios from individual pages. Everything stays private and secure.</p>
        </div>
      </section>

      <RelatedContent slug="merge" />

      <UseCaseLinks toolSlug="merge" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
