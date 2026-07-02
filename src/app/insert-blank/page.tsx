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
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("insert-blank");

export default function InsertBlankPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState<"end" | "before" | "after">("end");
  const [refPage, setRefPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("insert-blank"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    const bytes = await f.arrayBuffer();
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runInsert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      if (mode === "end") {
        for (let i = 0; i < count; i++) {
          pdfDoc.addPage([width, height]);
        }
      } else if (mode === "after") {
        const insertIdx = Math.min(refPage, pdfDoc.getPageCount());
        const pages = pdfDoc.getPages();
        const toCopy = pages.slice(0, insertIdx);
        const rest = pages.slice(insertIdx);
        const newDoc = await PDFDocument.create();
        const copiedFront = await newDoc.copyPages(pdfDoc, toCopy.map((_, i) => i));
        copiedFront.forEach((p) => newDoc.addPage(p));
        for (let i = 0; i < count; i++) {
          newDoc.addPage([width, height]);
        }
        const copiedRest = await newDoc.copyPages(pdfDoc, rest.map((_, i) => insertIdx + i));
        copiedRest.forEach((p) => newDoc.addPage(p));
        const saved = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([saved as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inserted-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        trackExport(file.name, "Insert Blank Pages", saved.length);
        setSuccess(true);
        setProcessing(false);
        return;
      } else if (mode === "before") {
        const insertIdx = Math.max(0, Math.min(refPage - 1, pdfDoc.getPageCount()));
        const pages = pdfDoc.getPages();
        const toCopy = pages.slice(0, insertIdx);
        const rest = pages.slice(insertIdx);
        const newDoc = await PDFDocument.create();
        const copiedFront = await newDoc.copyPages(pdfDoc, toCopy.map((_, i) => i));
        copiedFront.forEach((p) => newDoc.addPage(p));
        for (let i = 0; i < count; i++) {
          newDoc.addPage([width, height]);
        }
        const copiedRest = await newDoc.copyPages(pdfDoc, rest.map((_, i) => insertIdx + i));
        copiedRest.forEach((p) => newDoc.addPage(p));
        const saved = await newDoc.save({ useObjectStreams: true });
        const blob = new Blob([saved as unknown as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inserted-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
        trackExport(file.name, "Insert Blank Pages", saved.length);
        setSuccess(true);
        setProcessing(false);
        return;
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inserted-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Insert Blank Pages", pdfBytes.length);
      setSuccess(true);
    } catch {
      setError("Failed to insert blank pages. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [file, count, mode, refPage]);

  const insert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runInsert();
    }, [usage, upsell, runInsert])

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
        name="Insert Blank Pages - Free Online PDF Tool"
        description="Add blank pages to any PDF file. Insert empty pages at the end of your document for free."
        url="https://allaboutpdfediting.xyz/insert-blank"
      />
      <HowToJsonLd name="Insert Blank Pages in PDF" description="Add empty pages to any PDF document at specific positions" steps={[{name:"Upload PDF",text:"Select the PDF to add blank pages to"},{name:"Set position and count",text:"Choose where to insert blank pages and how many"},{name:"Download updated PDF",text:"Download the PDF with blank pages inserted"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Insert Blank Pages", item: "https://allaboutpdfediting.xyz/insert-blank" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Insert Blank Pages" summary="Add empty blank pages to PDF documents at any position" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Blank page insertion","Position control","Multiple pages","Free online tool","Client-side"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Insert Blank Pages</h1>
        <p className="text-[var(--muted)]">Add blank pages anywhere in your PDF document.</p>
      </div>

      <ToolInfo
        name="Insert Blank Pages"
        description="Your PDF never leaves your device. All processing happens locally in your browser using pdf-lib — no uploads, no servers. Choose how many blank pages to add and where to insert them, then download instantly."
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
            <span className="text-5xl">📄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Inserting blank pages..." />

        {file && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Number of blank pages</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-24 px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Insert location</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "end", label: "At end" },
                  { value: "before", label: "Before page" },
                  { value: "after", label: "After page" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value as typeof mode)}
                    className={`py-2 rounded-lg border text-xs font-medium transition ${
                      mode === opt.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--card-border)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(mode === "before" || mode === "after") && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-[var(--muted)]">Page number:</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={refPage}
                  onChange={(e) => setRefPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="w-24 px-3 py-2 border border-[var(--card-border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] text-sm"
                />
                <span className="text-xs text-[var(--muted)]">(1 to {pageCount})</span>
              </div>
            )}

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runInsert(); }} />}

            <button
              onClick={insert}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Inserting pages...
                </span>
              ) : `Insert ${count} blank page${count > 1 ? "s" : ""}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}
          </div>
        )}

        {error && <ErrorBanner message={error} onRetry={runInsert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Blank pages inserted!" details={`${count} page${count > 1 ? "s" : ""} added to "${file?.name}"`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Insert Blank Pages</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our free insert blank PDF pages tool lets you add empty pages to any PDF document. You can insert multiple blank pages at the end of your document, before a specific page, or after a specific page — perfect for adding section dividers, note pages, or formatting your document layout.</p>
          <p>All processing is done locally in your browser using pdf-lib, so your files never leave your device. The blank pages match the dimensions of your first page to keep your document consistent. Whether you are preparing a report, creating a workbook, or organizing scanned documents, this tool helps you structure your PDF exactly how you need it.</p>
          <p>Keywords: insert blank pages in PDF online free, add empty pages to PDF, PDF page inserter, add blank page to PDF, insert page into PDF.</p>
        </div>
      </div>

      <RelatedContent slug="insert-blank" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
