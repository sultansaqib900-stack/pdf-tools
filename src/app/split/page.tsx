"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import ToolShell from "@/components/ui/ToolShell";
import DropZone from "@/components/ui/DropZone";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("split");

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
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSplit();
    }, [usage, upsell, runSplit])

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
    <ToolShell
      icon="split"
      title="Split PDF"
      lead="Extract a page range or break a document into single pages. Processed on your device."
    >
      <SoftwareAppJsonLd
        name="Split PDF - Free Online PDF Tool"
        description="Split PDF files online for free. Extract pages from PDF documents instantly in your browser. No uploads."
        url="https://allaboutpdfediting.xyz/split"
      />
      <HowToJsonLd name="Split PDF Pages Online" description="Separate PDF pages into multiple files or extract specific pages" steps={[{name:"Upload PDF",text:"Select the PDF file to split"},{name:"Choose split method",text:"Select page ranges or split every page"},{name:"Download split files",text:"Download the individual PDF files"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Split PDF", item: "https://allaboutpdfediting.xyz/split" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Split PDF" summary="Separate PDF pages into multiple documents or extract specific page ranges" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page range extraction","Split every page","Multiple output files","Client-side processing","Free"]} limits="Files up to 10MB" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <DropZone
          file={file}
          onFile={handleFile}
          hint={pageCount > 0 ? `${pageCount} page${pageCount > 1 ? "s" : ""}` : "PDF up to 10 MB"}
        />

        <ProgressBar processing={processing} fileSize={file?.size} label="Splitting PDF..." />

        {pageCount > 0 && (
          <div className="mt-6 space-y-5">
            <div className="inline-flex p-0.5 rounded-[var(--r-md)] bg-[var(--surface-sunken)] border border-[var(--border)]">
              {([["all", "Every page"], ["range", "Page range"]] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={`px-3 py-1.5 rounded-[var(--r-sm)] text-[0.8125rem] font-medium transition-colors ${
                    mode === id
                      ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-xs)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "range" && (
              <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface-subtle)]">
                <label htmlFor="fromPage" className="text-[0.8125rem] text-[var(--muted)]">From</label>
                <input id="fromPage" type="number" min={1} max={pageCount} value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="input w-20 tabular-nums" />
                <label htmlFor="toPage" className="text-[0.8125rem] text-[var(--muted)]">to</label>
                <input id="toPage" type="number" min={1} max={pageCount} value={endPage}
                  onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="input w-20 tabular-nums" />
                <span className="text-[0.75rem] text-[var(--muted)]">of {pageCount}</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSplit(); }} />}

            <button
              onClick={split}
              disabled={processing || showTimer}
              className="btn btn-primary btn-lg w-full"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Splitting
                </>
              ) : mode === "all" ? `Split into ${pageCount} files` : `Extract pages ${startPage}–${endPage}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-[0.75rem] text-[var(--muted)]">
                Free tier is limited to 10 MB.{" "}
                <a href="/premium" className="font-medium text-[var(--accent)] hover:underline">Upgrade for 100 MB and batch processing</a>
              </p>
            )}
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runSplit} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Split complete!" onRestore={restoreOriginal} />
      </div>

      <section className="mt-10 pt-8 border-t border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">About this tool</h2>
        <div className="text-[0.875rem] leading-relaxed text-[var(--muted-strong)] space-y-3">
          <p>Need to split PDF online free? Our tool lets you extract PDF pages or split every page into individual files, giving you complete flexibility over how you manage your documents. Choose between extracting a specific page range or splitting the entire document into separate pages — the choice is yours. This is ideal when you need only certain sections from a large report, want to share pages one at a time, or need to reorganize content by removing specific pages. Processing happens entirely client-side using pdf-lib, meaning your document never leaves your browser. To extract PDF pages, simply upload your file, select your range, and download. Each extracted page preserves original quality and formatting, so you get clean, accurate results every time.</p>
        </div>
      </section>

      <RelatedContent slug="split" />

      <UseCaseLinks toolSlug="split" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
