"use client";

import { isPdfFile, loadPdfForEditing, downloadBytes, formatPdfErrorMessage, validatePdfOutput } from "@/lib/pdfBytes";
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
import PipelineActionBar from "@/components/PipelineActionBar";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("delete-pages");

interface PageItem {
  index: number;
  checked: boolean;
}

export default function DeletePagesPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("delete-pages"); }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f) return;
    if (!isPdfFile(f)) {
      setError("Please select a valid PDF file.");
      return;
    }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    
    setSuccess(false);
    setError(null);
    setResultBytes(null);
    setDownloadUrl(null);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await loadPdfForEditing(bytes);
      const count = pdf.getPageCount();
      if (count === 0) {
        throw new Error("This PDF document contains no pages.");
      }
      originalBytes.current = bytes;
      setFile(f);
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, checked: true })));
    } catch (err) {
      setFile(null);
      setError(formatPdfErrorMessage(err, "Failed to load PDF. The document may be corrupted or password-protected."));
    }
  }, [upsell]);

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
    if (!canProceed) { setProcessing(false); upsell.showUpsell("trial-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const sourcePdf = await loadPdfForEditing(bytes);
      const indicesToKeep = pages.filter((p) => p.checked).map((p) => p.index);

      if (indicesToKeep.length === 0) {
        setError("Select at least one page to keep. You cannot delete all pages.");
        setProcessing(false);
        return;
      }

      if (indicesToKeep.length === pages.length) {
        setError("All pages are currently selected. Uncheck the pages you wish to remove.");
        setProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, indicesToKeep);
      copiedPages.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save({ useObjectStreams: true });
      const validation = await validatePdfOutput(pdfBytes);
      if (!validation.ok) {
        throw new Error(validation.error || "Generated document is invalid.");
      }

      setResultBytes(pdfBytes);
      const url = downloadBytes(pdfBytes, `filtered-${file.name}`);
      setDownloadUrl(url);
      trackExport(file.name, "Delete Pages", pdfBytes.length);
      setSuccess(true);
    } catch (err) {
      setError(formatPdfErrorMessage(err, "Failed to delete pages from PDF."));
    } finally {
      setProcessing(false);
    }
  }, [file, pages, usage, upsell, trackExport]);

  const deletePages = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("trial-limit"); return; }
      setShowTimer(true);
      return;
    }
    runDelete();
  }, [usage, upsell, runDelete]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current || !file) return;
    downloadBytes(originalBytes.current, `original-${file.name}`);
  }, [file]);

  const resetTool = useCallback(() => {
    setFile(null);
    setPages([]);
    setError(null);
    setSuccess(false);
    setResultBytes(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    originalBytes.current = null;
  }, [downloadUrl]);

  const checkedCount = pages.filter((p) => p.checked).length;
  const removedCount = pages.length - checkedCount;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Delete PDF Pages - Free Online PDF Tool"
        description="Delete pages from PDF documents online for free. Remove unwanted PDF pages instantly in your browser."
        url="https://allaboutpdfediting.xyz/delete-pages"
      />
      <HowToJsonLd name="Delete PDF Pages Online" description="Remove unwanted pages from a PDF" steps={[{name:"Upload PDF",text:"Select the PDF document to remove pages from"},{name:"Select pages",text:"Uncheck the pages you want to delete"},{name:"Download",text:"Download the modified PDF without the deleted pages"}]} />
      <Breadcrumbs items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Delete Pages", item: "https://allaboutpdfediting.xyz/delete-pages" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Delete Pages" summary="Visually select and remove unwanted pages from any PDF with instant browser processing" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page thumbnail selection","Keep/remove toggles","Instant processing","No file uploads","Undo support"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Delete PDF Pages</h1>
        <p className="text-[var(--muted)]">Uncheck the pages you want to remove, then download the result.</p>
      </div>

      <ToolInfo
        name="Delete PDF Pages"
        description="Your file stays on your device. All processing happens locally in your browser using pdf-lib — no uploads, no servers. Select which pages to remove and download the result instantly."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} tier={usage.tier} />
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
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🗑️</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">{pages.length} page{pages.length > 1 ? "s" : ""}</span>
                <span>·</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetTool();
                  }}
                  className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                >
                  Change file
                </button>
              </div>
            )}
            {!file && <span className="text-xs text-[var(--muted)]">Max {isPremium() ? "100MB" : "10MB"} · 100% Private Client-Side</span>}
          </label>
        </div>

        {pages.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Keeping {checkedCount} of {pages.length} pages
                {removedCount > 0 && <span className="text-red-500 ml-1">({removedCount} will be deleted)</span>}
              </span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
              >
                {pages.every((p) => p.checked) ? "Uncheck all" : "Select all"}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-2 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
              {pages.map((page) => (
                <button
                  key={page.index}
                  type="button"
                  onClick={() => togglePage(page.index)}
                  className={`p-3 rounded-lg border text-center font-medium text-xs transition ${
                    page.checked
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                      : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] opacity-50 line-through"
                  }`}
                >
                  Page {page.index + 1}
                </button>
              ))}
            </div>

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runDelete(); }} />}

            <button
              onClick={deletePages}
              disabled={processing || showTimer || checkedCount === 0 || removedCount === 0}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing...
                </span>
              ) : removedCount > 0 ? `Remove ${removedCount} page${removedCount > 1 ? "s" : ""} & download (${checkedCount} pages left)` : "Select pages to remove"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB files & batch</a>
              </p>
            )}

            {error && <ErrorBanner message={error} onRetry={runDelete} onDismiss={() => setError(null)} />}

            <SuccessAnimation show={success} message="Pages deleted successfully!" onRestore={restoreOriginal} />

            {success && resultBytes && (
              <PipelineActionBar
                pdfBytes={resultBytes}
                filename={`filtered-${file?.name || "document.pdf"}`}
                downloadUrl={downloadUrl}
                currentToolName="Delete Pages"
              />
            )}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Delete PDF Pages</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Remove unwanted, blank, or duplicate pages from any PDF document quickly and securely. Whether you have accidental blank pages from a scanner, sensitive pages that should not be shared, or unnecessary cover sheets, our delete PDF pages tool lets you select exactly which pages to keep and which to remove. To delete pages from PDF online free, upload your document, click on the page numbers you want to exclude, and download the trimmed version instantly. All processing happens entirely inside your browser using pdf-lib — your files are never uploaded to any remote server, guaranteeing full confidentiality for private contracts, financial statements, and medical records. It takes just seconds to clean up your PDFs before emailing or publishing them.</p>
        </div>
      </div>
      <RelatedContent slug="delete-pages" />

      <UseCaseLinks toolSlug="delete-pages" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
