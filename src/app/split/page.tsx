"use client";

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
import { createZipArchive } from "@/lib/archive";
import { isPdfFile, downloadBytes, loadPdfForEditing, validatePdfOutput, formatPdfErrorMessage } from "@/lib/pdfBytes";

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
    if (!f) return;
    if (!isPdfFile(f)) {
      setError("Please select a valid PDF file.");
      return;
    }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }

    setError(null);
    setSuccess(false);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await loadPdfForEditing(bytes);
      const count = pdf.getPageCount();
      if (count === 0) {
        throw new Error("This PDF document contains no pages.");
      }
      originalBytes.current = bytes;
      setFile(f);
      setPageCount(count);
      setEndPage(count);
      setStartPage(1);
    } catch (err) {
      setFile(null);
      setError(formatPdfErrorMessage(err, "Failed to load PDF. The file may be encrypted or corrupted."));
    }
  }, [upsell]);

  const runSplit = useCallback(async () => {
    if (!file || pageCount === 0) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("trial-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const sourcePdf = await loadPdfForEditing(bytes);

      if (mode === "all") {
        const outputFiles: { name: string; bytes: Uint8Array }[] = [];
        const padding = String(sourcePdf.getPageCount()).length;
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);
          const singleBytes = await newPdf.save({ useObjectStreams: true });
          outputFiles.push({
            name: `page-${String(i + 1).padStart(padding, "0")}.pdf`,
            bytes: singleBytes,
          });
        }
        const archive = createZipArchive(outputFiles);
        const baseName = file.name.replace(/\.pdf$/i, "") || "split-pages";
        downloadBytes(archive, `${baseName}-pages.zip`, "application/zip");
        trackExport(file.name, "Split PDF", archive.byteLength);
      } else {
        const s = Math.max(1, Math.min(pageCount, startPage));
        const e = Math.max(1, Math.min(pageCount, endPage));

        if (s > e) {
          throw new Error("The start page cannot come after the end page.");
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: e - s + 1 }, (_, i) => s - 1 + i);
        const pages = await newPdf.copyPages(sourcePdf, pageIndices);
        pages.forEach((p) => newPdf.addPage(p));
        const pdfBytes = await newPdf.save({ useObjectStreams: true });

        const validation = await validatePdfOutput(pdfBytes);
        if (!validation.ok) {
          throw new Error(validation.error || "Generated split document is invalid.");
        }

        downloadBytes(pdfBytes, `pages-${s}-${e}-${file.name}`);
        trackExport(file.name, "Split PDF", pdfBytes.byteLength);
      }
      setSuccess(true);
    } catch (splitError) {
      setError(formatPdfErrorMessage(splitError, "Failed to split PDF. The file may be encrypted or corrupted."));
    } finally {
      setProcessing(false);
    }
  }, [file, mode, startPage, endPage, pageCount, usage, upsell, trackExport]);

  const split = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("trial-limit"); return; }
      setShowTimer(true);
      return;
    }
    runSplit();
  }, [usage, upsell, runSplit]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current || !file) return;
    downloadBytes(originalBytes.current, `original-${file.name}`);
  }, [file]);

  const resetTool = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setError(null);
    setSuccess(false);
    originalBytes.current = null;
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Split PDF - Free Online PDF Tool"
        description="Split PDF files into individual pages or extract page ranges online for free. Fast, secure, and client-side processing."
        url="https://allaboutpdfediting.xyz/split"
      />
      <HowToJsonLd name="Split PDF Pages Online" description="Extract individual pages or ranges from a PDF" steps={[{name:"Upload PDF",text:"Select or drop the PDF you want to split"},{name:"Choose split mode",text:"Choose to extract all pages into a ZIP or specify a page range"},{name:"Download",text:"Download the extracted pages or page range"}]} />
      <Breadcrumbs items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Split PDF", item: "https://allaboutpdfediting.xyz/split" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Split PDF" summary="Extract page ranges or split into individual pages packaged as a ZIP" category="Utilities" inputType="PDF" outputType="PDF/ZIP" processing="client-side" price="free" features={["Extract all pages","Extract page range","ZIP download","Free processing","No file uploads"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Split PDF</h1>
        <p className="text-[var(--muted)]">Extract individual pages into a ZIP or save a specific page range.</p>
      </div>

      <ToolInfo
        name="Split PDF"
        description="Your files stay on your device. Splitting is done entirely in your browser using pdf-lib — no uploads, no servers involved. Extract individual pages or ranges and download instantly."
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
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">{pageCount} page{pageCount > 1 ? "s" : ""}</span>
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

        <ProgressBar processing={processing} fileSize={file?.size} label="Splitting PDF..." />

        {pageCount > 0 && (
          <div className="mt-6 space-y-5">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "all"} onChange={() => setMode("all")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extract all pages (ZIP)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" checked={mode === "range"} onChange={() => setMode("range")} className="accent-indigo-600" />
                <span className="text-sm text-[var(--foreground)]">Extract page range</span>
              </label>
            </div>

            {mode === "range" && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-lg">
                <label className="text-sm text-[var(--muted)]">From page:</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="w-20 px-3 py-1.5 border border-[var(--card-border)] rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)]"
                />
                <label className="text-sm text-[var(--muted)]">To page:</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={endPage}
                  onChange={(e) => setEndPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="w-20 px-3 py-1.5 border border-[var(--card-border)] rounded-lg text-sm bg-[var(--card)] text-[var(--foreground)]"
                />
                <span className="text-xs text-[var(--muted)]">(1–{pageCount})</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runSplit(); }} />}

            <button
              onClick={split}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? "Splitting..." : mode === "all" ? "Extract All Pages to ZIP" : `Extract Pages ${startPage}–${endPage}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB files & batch</a>
              </p>
            )}

            {error && <ErrorBanner message={error} onRetry={runSplit} onDismiss={() => setError(null)} />}

            <SuccessAnimation show={success} message="PDF split successfully!" onRestore={restoreOriginal} />
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Split PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Separate a large document into individual pages or extract precisely the page range you need. Split PDF operates entirely within your browser — no files are transmitted to any server, guaranteeing privacy for confidential reports, invoices, or records.</p>
        </div>
      </div>
      <RelatedContent slug="split" />

      <UseCaseLinks toolSlug="split" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
