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

const rc = getRelatedContent("pdf-to-excel");

export default function PdfToExcelPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [csv, setCsv] = useState<string>("");
  const [tableCount, setTableCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { trackToolVisit("pdf-to-excel"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (f && f.type === "application/pdf") {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
      setFile(f);
      setCsv("");
      setError(null);
      setSuccess(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const runExtract = useCallback(async () => {
    if (!file || !canvasRef.current) return;
    setProcessing(true);
    setError(null);
    setCsv("");
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = canvasRef.current;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvas, viewport }).promise;
        const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
        pages.push(base64);
      }

      const res = await fetch("/api/extract-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Extraction failed.");

      const resultCsv = data.csv;
      setCsv(resultCsv);
      const count = resultCsv.split("\n\n").filter((b: string) => b.trim()).length;
      setTableCount(count);
      setSuccess(true);
      trackExport(file.name, "PDF to Excel", resultCsv.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract tables.");
    }
    setProcessing(false);
  }, [file, usage]);

  const extract = useCallback(async () => {
    if (!file) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runExtract();
    }, [usage, upsell, file, runExtract])

  const downloadCsv = useCallback(() => {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file ? file.name.replace(/\.pdf$/i, "") + ".csv" : "tables.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [csv, file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="PDF to Excel - Free Online Table Extractor"
        description="Extract tables from PDF files and convert to CSV online for free. Uses AI to detect and extract tabular data from your documents."
        url="https://allaboutpdfediting.xyz/pdf-to-excel"
      />
      <HowToJsonLd name="Convert PDF to Excel" description="Extract tables from PDF files to Excel CSV spreadsheets" steps={[{name:"Upload PDF",text:"Select the PDF with tables to extract"},{name:"Review extracted data",text:"Preview the extracted table data"},{name:"Download CSV",text:"Download the extracted data as a spreadsheet file"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to Excel", item: "https://allaboutpdfediting.xyz/pdf-to-excel" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="PDF to Excel" summary="Extract table data from PDF files to Excel CSV format" category="BusinessApplications" inputType="PDF" outputType="CSV" processing="client-side" price="free" features={["Table extraction","CSV export","Data preview","Free tool","Client-side"]} limits="Files up to 10MB" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PDF to Excel</h1>
        <p className="text-[var(--muted)]">Extract tables from PDF documents as CSV data.</p>
      </div>

      <ToolInfo
        name="PDF to Excel"
        description="Extract tables from your PDF using AI vision. Pages are rendered locally in your browser and sent securely to Google Gemini for table detection. No data is stored. Your CSV is ready to download instantly."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
            dragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
              : "border-[var(--card-border)] bg-[var(--background)]"
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
            <span className="text-5xl">📊</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Max 50MB · PDF format only</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Extracting tables with AI..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runExtract(); }} />}

        <button
          onClick={extract}
          disabled={!file || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Extracting tables...
            </span>
          ) : "Extract Tables"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runExtract} onDismiss={() => setError(null)} />}

        {csv && !processing && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {tableCount} table{tableCount !== 1 ? "s" : ""} found
              </span>
              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CSV
              </button>
            </div>
            <textarea
              readOnly
              value={csv}
              className="w-full h-64 p-4 text-xs font-mono bg-[var(--background)] border border-[var(--card-border)] rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[var(--foreground)]"
            />
            <p className="text-xs text-[var(--muted)]">Select all (Ctrl+A) and copy, or download the CSV file above.</p>
          </div>
        )}

        <SuccessAnimation show={success} message="Tables extracted!" details={`${tableCount} table${tableCount !== 1 ? "s" : ""} found`} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About PDF to Excel</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert PDF tables to CSV online for free with our AI-powered PDF to Excel tool. Upload a PDF containing tabular data — invoices, financial statements, reports, or spreadsheets — and our tool extracts all tables into clean CSV format using Google Gemini vision AI. Unlike traditional PDF table extractors that rely on text parsing, our approach uses vision AI to understand the layout and structure of every table on each page. This means it works even with scanned PDFs, image-based tables, and complex multi-column layouts. Each table is separated by a blank line in the output, and headers are preserved exactly as they appear. You can copy the CSV directly from the textarea or download it as a .csv file for use in Excel, Google Sheets, or any spreadsheet application. Your data is processed securely — pages are rendered locally in your browser and only the anonymized page images are sent to Gemini for extraction. No files are stored on our servers.</p>
        </div>
      </div>
      <RelatedContent slug="pdf-to-excel" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
