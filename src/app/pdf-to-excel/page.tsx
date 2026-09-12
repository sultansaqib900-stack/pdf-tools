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
import { escapeCsvCell, parseCsvRecords } from "@/lib/csv";

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
  const [allowAiFallback, setAllowAiFallback] = useState(false);
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
    setTableRows(parseCsvRecords(csvText));
  };

  // Fast Client-Side PDF Table Extractor using position analysis
  const extractClientSideTables = async (pdfBytes: ArrayBuffer): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    }

    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
    const allLines: string[] = [];
    try {
      const pdf = await loadingTask.promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Group text items by nearby Y baselines, then preserve X order.
        const rowsMap: Record<number, Array<{ x: number; text: string }>> = {};
        for (const item of content.items) {
          if (!("str" in item)) continue;
          const text = item.str?.trim();
          if (!text) continue;
          const y = Math.round(item.transform[5] / 3) * 3;
          if (!rowsMap[y]) rowsMap[y] = [];
          rowsMap[y].push({ x: item.transform[4], text });
        }

        const sortedY = Object.keys(rowsMap).map(Number).sort((first, second) => second - first);
        for (const y of sortedY) {
          const cells = rowsMap[y].sort((first, second) => first.x - second.x);
          allLines.push(cells.map((cell) => escapeCsvCell(cell.text)).join(","));
        }
        page.cleanup();
      }
    } finally {
      await loadingTask.destroy();
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

      // Scanned pages have no local text layer. Sending rendered pages to the
      // configured Gemini endpoint is opt-in because it leaves the browser.
      if (!extractedCsv) {
        if (!allowAiFallback) {
          throw new Error("No selectable text was found. Enable the optional AI fallback to send up to the first 3 rendered pages to the configured Gemini service.");
        }
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
        const pages: string[] = [];
        try {
          const pdf = await loadingTask.promise;
          for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas rendering is unavailable.");
            await page.render({ canvas, canvasContext: context, viewport }).promise;
            pages.push(canvas.toDataURL("image/jpeg", 0.8).split(",")[1]);
            page.cleanup();
          }
        } finally {
          await loadingTask.destroy();
        }

        const response = await fetch("/api/extract-tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pages }),
        });
        const data = await response.json() as { ok?: boolean; csv?: string; error?: string };
        if (!response.ok || !data.ok || !data.csv?.trim()) {
          throw new Error(data.error || "The configured AI service did not return table data.");
        }
        extractedCsv = data.csv.trim().replace(/^```(?:csv)?\s*/i, "").replace(/\s*```$/, "");
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
  }, [file, allowAiFallback, usage, upsell, trackExport]);

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
    navigator.clipboard.writeText(tableRows.map((row) => row.join("\t")).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredRows = tableRows.filter((r) =>
    searchTerm ? r.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) : true
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <SoftwareAppJsonLd
        name="PDF to CSV - Positioned Text Extractor"
        description="Group selectable PDF text by nearby baselines and horizontal position, then export the heuristic result as CSV."
        url="https://allaboutpdfediting.xyz/pdf-to-excel"
      />
      <HowToJsonLd
        name="Extract Positioned PDF Text to CSV"
        description="Heuristically group selectable PDF text items into CSV rows"
        steps={[
          { name: "Upload PDF", text: "Select a PDF with positioned selectable text" },
          { name: "Group text", text: "Group nearby text baselines into rows and sort cells by horizontal position" },
          { name: "Review and download", text: "Review the heuristic grid before copying it or downloading CSV" },
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
        name="PDF to CSV"
        summary="Heuristically group positioned selectable PDF text into CSV rows with a reviewable grid"
        category="BusinessApplications"
        inputType="PDF"
        outputType="CSV"
        processing="client-side by default; optional opt-in Gemini fallback for scanned pages"
        price="free"
        features={["Baseline row grouping", "Horizontal text ordering", "CSV preview", "Opt-in scanned-page AI fallback"]}
        limits="Complex layouts require manual review; AI fallback sends up to the first 3 pages to Google Gemini"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="mb-4">
        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          📊 Positioned Text to CSV
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mt-2 mb-2">
          PDF to CSV Extractor
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Group selectable PDF text by page position into a reviewable CSV grid.
        </p>
      </div>

      <ToolInfo
        name="PDF to CSV"
        description="Local mode groups text items by nearby Y baselines and sorts them by X position; it does not infer merged cells or guarantee table structure. The optional AI fallback is clearly opt-in because rendered pages leave the browser."
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
              {file ? file.name : "Click to select or drop a PDF"}
            </span>
            {file && <span className="text-xs text-[var(--muted)]">{(file.size / (1024 * 1024)).toFixed(2)} MB · Local unless you enable AI fallback</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Best for PDFs whose table cells are separate positioned text items</span>}
          </label>
        </div>

        <label className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 cursor-pointer">
          <input type="checkbox" checked={allowAiFallback} onChange={(event) => setAllowAiFallback(event.target.checked)} className="mt-0.5 accent-amber-500" />
          <span className="text-xs text-[var(--muted)] leading-relaxed"><strong className="text-[var(--foreground)]">Optional scanned-page AI fallback:</strong> if no selectable text exists, send rendered images of up to the first 3 pages through this site&apos;s server to the configured Google Gemini API. Leave off to keep processing entirely local.</span>
        </label>

        <ProgressBar processing={processing} fileSize={file?.size} label="Extracting positioned text into CSV rows..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runExtract(); }} />}

        {file && (
          <button
            onClick={extract}
            disabled={processing || showTimer}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-40 transition-all text-base shadow-xl shadow-emerald-500/25 active:scale-[0.99]"
          >
            {processing ? "Extracting Positioned Text..." : "⚡ Extract Positioned Text to CSV"}
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
                  Review-only grid: searchable, copy-ready, and available as CSV.
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
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Positioned PDF Text Extraction</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>The local heuristic groups text items with nearby vertical baselines into rows and orders each row by horizontal position. This works for many simple text-based tables, but PDFs do not store a universal table model, so merged cells, wrapped rows, and decorative layouts can be grouped incorrectly. Review every row before relying on the CSV.</p>
          <p>Scanned pages have no selectable text. If you explicitly enable the AI fallback, images of up to the first three pages are sent through this site&apos;s API to the configured Google Gemini service; otherwise no page content is uploaded.</p>
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
