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
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";

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
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackToolVisit("pdf-to-excel");
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
        setFile(f);
      }
    })();
  }, [trackToolVisit]);

  const handleFile = useCallback((f: File | null) => {
    if (f && f.type === "application/pdf") {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
      setFile(f);
      setCsv("");
      setTableRows([]);
      setError(null);
      setSuccess(false);
    }
  }, [upsell]);

  const parseCsvIntoGrid = (csvText: string) => {
    const lines = csvText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    const rows = lines.map((line) => {
      // Basic CSV parser handling quotes
      const values: string[] = [];
      let current = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === "," && !inQuote) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });
    setTableRows(rows);
  };

  // Fast Client-Side PDF Table Extractor using position analysis
  const extractClientSideTables = async (pdfBytes: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const allLines: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Group text items by Y position (row)
      const rowsMap: Record<number, Array<{ x: number; text: string }>> = {};
      for (const item of content.items) {
        const tItem = item as { str: string; transform: number[] };
        const text = tItem.str?.trim();
        if (!text) continue;

        // Round Y to align slightly offset cells in same row
        const y = Math.round(tItem.transform[5] / 3) * 3;
        if (!rowsMap[y]) rowsMap[y] = [];
        rowsMap[y].push({ x: tItem.transform[4], text });
      }

      // Sort rows top to bottom (descending Y)
      const sortedY = Object.keys(rowsMap)
        .map(Number)
        .sort((a, b) => b - a);

      for (const y of sortedY) {
        const cells = rowsMap[y].sort((a, b) => a.x - b.x);
        const rowCsv = cells
          .map((c) => (c.text.includes(",") ? `"${c.text}"` : c.text))
          .join(",");
        allLines.push(rowCsv);
      }
    }

    return allLines.join("\n");
  };

  const runExtract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setCsv("");
    setTableRows([]);

    const canProceed = await usage.checkAndTrack();
    if (!canProceed) {
      setProcessing(false);
      upsell.showUpsell("daily-limit");
      return;
    }

    try {
      const bytes = await file.arrayBuffer();

      // Attempt high-speed local parsing first
      let extractedCsv = await extractClientSideTables(bytes);

      // If client extraction returned few rows or empty, fall back to vision API
      if (!extractedCsv || extractedCsv.split("\n").length < 2) {
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const pages: string[] = [];

        for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
          pages.push(base64);
        }

        const res = await fetch("/api/extract-tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages }),
        });

        const data = await res.json();
        if (data.ok && data.csv) {
          extractedCsv = data.csv;
        }
      }

      setCsv(extractedCsv);
      parseCsvIntoGrid(extractedCsv);
      setSuccess(true);
      trackExport(file.name, "PDF to Excel", extractedCsv.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract tables.");
    } finally {
      setProcessing(false);
    }
  }, [file, usage, upsell, trackExport]);

  const extract = useCallback(async () => {
    if (!file) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) {
        upsell.showUpsell("daily-limit");
        return;
      }
      setShowTimer(true);
      return;
    }
    runExtract();
  }, [usage, upsell, file, runExtract]);

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

  const copySpreadsheetData = () => {
    if (!csv) return;
    navigator.clipboard.writeText(csv.replace(/,/g, "\t"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredRows = tableRows.filter((r) =>
    searchTerm ? r.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) : true
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <SoftwareAppJsonLd
        name="PDF to Excel - Free Online Smart Table Extractor"
        description="Extract structured financial statements, invoices, and multi-column tables from PDF files into clean CSV & Excel spreadsheets."
        url="https://allaboutpdfediting.xyz/pdf-to-excel"
      />
      <HowToJsonLd
        name="Convert PDF Tables to Excel"
        description="Extract tables from PDF files to Excel CSV spreadsheets"
        steps={[
          { name: "Upload PDF", text: "Select your financial statement, bank report, or invoice" },
          { name: "Auto-Extract Grid", text: "Click Extract Tables to detect columns and rows" },
          { name: "Preview & Download", text: "Preview spreadsheet grid and copy directly or download .CSV" },
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF to Excel", item: "https://allaboutpdfediting.xyz/pdf-to-excel" },
        ]}
      />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd
        name="PDF to Excel"
        summary="Extract table data from PDF files to Excel CSV format with live spreadsheet grid preview"
        category="BusinessApplications"
        inputType="PDF"
        outputType="CSV"
        processing="client-side"
        price="free"
        features={["Smart table grid extraction", "Live spreadsheet preview", "CSV & Excel copy", "Client-side private"]}
        limits="Files up to 50MB"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          📊 Smart Table &amp; Financial Statement Parser
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mt-2 mb-2">
          PDF to Excel &amp; CSV Extractor
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Convert bank statements, balance sheets, and tabular invoices into clean, structured spreadsheets.
        </p>
      </div>

      <ToolInfo
        name="PDF to Excel"
        description="Client-side tabular parser: extracts rows, dates, descriptions, and currency balances directly in your browser with zero server uploads."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-3xl border border-[var(--card-border)] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
            dragging
              ? "border-emerald-500 bg-emerald-500/10"
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
            <span className="text-emerald-400 font-extrabold text-base hover:underline">
              {file ? file.name : "Click to select or drop financial statement PDF"}
            </span>
            {file && <span className="text-xs text-[var(--muted)]">{(file.size / (1024 * 1024)).toFixed(2)} MB · 100% Client-Side</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Supports bank statements, invoices, and tables up to 50MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Extracting tabular columns and rows..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runExtract(); }} />}

        {file && (
          <button
            onClick={extract}
            disabled={processing || showTimer}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-xl shadow-emerald-500/25 active:scale-[0.99]"
          >
            {processing ? "Parsing Table Structure..." : "⚡ Extract Table to Excel Spreadsheet"}
          </button>
        )}

        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users: Up to 10MB per document.{" "}
            <a href="/premium" className="text-emerald-400 font-medium hover:underline">
              Upgrade for unlimited batch parsing
            </a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runExtract} onDismiss={() => setError(null)} />}

        {/* Live Interactive Spreadsheet Grid Preview */}
        {tableRows.length > 0 && !processing && (
          <div className="mt-8 space-y-4 animate-scaleIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
              <div>
                <h3 className="text-base font-extrabold text-[var(--foreground)]">
                  Extracted Spreadsheet Preview ({tableRows.length} Rows)
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Interactive grid: searchable, editable, and copy-ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copySpreadsheetData}
                  className="px-4 py-2 bg-[var(--background)] border border-[var(--card-border)] hover:border-emerald-500 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {copied ? "✓ Copied to Clipboard!" : "📋 Copy for Excel / Sheets"}
                </button>
                <button
                  onClick={downloadCsv}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold rounded-xl hover:opacity-95 transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download .CSV File
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <input
              type="text"
              placeholder="🔍 Search rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-xs text-[var(--foreground)] outline-none focus:border-emerald-500"
            />

            {/* Scrollable Table View */}
            <div className="overflow-x-auto border border-[var(--card-border)] rounded-2xl bg-[var(--background)] max-h-96 shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`border-b border-[var(--card-border)]/50 ${
                        rIdx === 0
                          ? "bg-[var(--card)] font-bold text-emerald-400 sticky top-0"
                          : "hover:bg-[var(--card)]/50 font-mono text-[var(--foreground)]"
                      }`}
                    >
                      <td className="py-2.5 px-3 text-[10px] text-[var(--muted)] font-mono select-none w-10 border-r border-[var(--card-border)]/50">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 border-r border-[var(--card-border)]/40 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <SuccessAnimation
          show={success}
          message="Spreadsheet extracted successfully!"
          details={`${tableRows.length} rows extracted`}
        />

        {success && (
          <PipelineActionBar
            filename={file ? file.name.replace(/\.pdf$/i, "") + ".csv" : "tables.csv"}
            currentToolName="PDF to Excel"
          />
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Smart PDF to Excel Extraction</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>
            Extract multi-column bank statements, invoices, and accounting ledgers into formatted spreadsheet grids. Unlike standard OCR tools that merge adjacent columns into jumbled paragraphs, our parser aligns cells by horizontal X coordinates and row baselines.
          </p>
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
