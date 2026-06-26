"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import { isPremium, checkFileSize } from "@/lib/premium";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

const sizes: { label: string; w: number; h: number }[] = [
  { label: "A4 (210×297 mm)", w: 595.28, h: 841.89 },
  { label: "Letter (8.5×11 in)", w: 612, h: 792 },
  { label: "Legal (8.5×14 in)", w: 612, h: 1008 },
  { label: "A3 (297×420 mm)", w: 841.89, h: 1190.55 },
  { label: "A5 (148×210 mm)", w: 419.53, h: 595.28 },
  { label: "Tabloid (11×17 in)", w: 792, h: 1224 },
  { label: "Executive (7.25×10.5 in)", w: 522, h: 756 },
  { label: "Folio (8.5×13 in)", w: 612, h: 936 },
];

export default function ResizePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("A4 (210×297 mm)");
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("resize"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runResize = useCallback(async () => {
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

      let targetW: number, targetH: number;
      if (mode === "preset") {
        const s = sizes.find((s) => s.label === selectedSize)!;
        targetW = s.w; targetH = s.h;
      } else {
        targetW = parseFloat(customW); targetH = parseFloat(customH);
        if (!targetW || !targetH || targetW < 50 || targetH < 50) {
          setError("Enter valid dimensions (min 50)."); setProcessing(false); return;
        }
      }

      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        page.setMediaBox(0, 0, targetW, targetH);
        if (width > targetW || height > targetH) {
          page.setCropBox(0, 0, targetW, targetH);
        }
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resized-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Resize PDF", pdfBytes.length);
      setSuccess(true);
    } catch { setError("Failed to resize PDF."); }
    setProcessing(false);
  }, [file, selectedSize, mode, customW, customH]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runResize();
  }, [runResize]);

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
        name="Resize PDF - Free Online Tool"
        description="Change PDF page size online for free. Choose A4 Letter Legal or custom dimensions."
        url="https://allaboutpdfediting.xyz/resize"
      />
      <HowToJsonLd name="Resize PDF Pages" description="Change PDF page size to A4 Letter Legal or custom dimensions" steps={[{name:"Upload PDF",text:"Select the PDF to resize"},{name:"Choose page size",text:"Select A4 Letter Legal or enter custom dimensions"},{name:"Download resized PDF",text:"Download the PDF with new page dimensions"}]} />
      <AiSummaryJsonLd name="Resize PDF" summary="Change PDF page dimensions to standard sizes like A4 Letter Legal or custom" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page resizing","A4 Letter Legal","Custom dimensions","Free browser tool","Client-side"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Resize PDF Pages</h1>
        <p className="text-[var(--muted)]">Change the page size of your PDF document. Choose a preset or set custom dimensions.</p>
      </div>

      <ToolInfo name="Resize PDF" description="Your file stays private. All page resizing happens locally in your browser — no uploads, no servers. Change page dimensions in seconds." />

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
            <span className="text-5xl">📐</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB &middot; {pageCount} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-5">
            <div className="flex gap-3">
              <button onClick={() => setMode("preset")} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${mode === "preset" ? "bg-indigo-600 text-white" : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>Preset Sizes</button>
              <button onClick={() => setMode("custom")} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${mode === "custom" ? "bg-indigo-600 text-white" : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>Custom Size</button>
            </div>

            {mode === "preset" ? (
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((s) => (
                  <button key={s.label} onClick={() => setSelectedSize(s.label)}
                    className={`px-4 py-3 rounded-xl text-sm text-left border transition ${selectedSize === s.label ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300" : "border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-300"}`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs opacity-70">{s.w.toFixed(0)} × {s.h.toFixed(0)} pt</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Width (points)</label>
                  <input type="number" min={50} value={customW} onChange={(e) => setCustomW(e.target.value)} placeholder="612" className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Height (points)</label>
                  <input type="number" min={50} value={customH} onChange={(e) => setCustomH(e.target.value)} placeholder="792" className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" />
                </div>
              </div>
            )}

            <p className="text-xs text-[var(--muted)]">Content is not scaled — page boundaries are adjusted. Use Crop PDF to remove excess whitespace.</p>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runResize(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Resizing pages..." />

        {file && (
          <>
            <button
              onClick={process}
              disabled={processing || (mode === "custom" && (!customW || !customH)) || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Resizing pages...
                </span>
              ) : `Resize to ${mode === "preset" ? selectedSize.split(" ")[0] : `${customW}×${customH}`}`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB &amp; 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runResize} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Pages resized successfully!" details={`${pageCount} pages resized`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Resize PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Change the page size of PDF documents online for free. Choose from standard formats like A4, Letter, Legal, A3, or set custom dimensions. Perfect for resizing documents to meet submission requirements, printing standards, or formatting needs.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. Note that page content is not scaled; only the page boundaries are adjusted.</p>
          <p>Keywords: resize PDF online free, change PDF page size, PDF to A4 online, PDF page dimensions, change PDF paper size.</p>
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
