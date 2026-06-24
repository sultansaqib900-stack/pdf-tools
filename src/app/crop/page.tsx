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
import BeforeAfterPreview from "@/components/BeforeAfterPreview";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

export default function CropPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState("0");
  const [bottom, setBottom] = useState("0");
  const [left, setLeft] = useState("0");
  const [right, setRight] = useState("0");
  const [unit, setUnit] = useState<"pt" | "mm">("pt");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [previewBytes, setPreviewBytes] = useState<ArrayBuffer | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const outBytesRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("crop"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    setError(null);
    setPreviewBytes(null);
    outBytesRef.current = null;
    const { PDFDocument } = await import("pdf-lib");
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runCrop = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = originalBytes.current!.slice(0);
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const t = parseFloat(top) || 0;
      const b = parseFloat(bottom) || 0;
      const l = parseFloat(left) || 0;
      const r = parseFloat(right) || 0;
      const mmToPt = unit === "mm" ? 2.83465 : 1;

      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const x = l * mmToPt;
        const y = b * mmToPt;
        const w = width - (l + r) * mmToPt;
        const h = height - (t + b) * mmToPt;
        if (w > 0 && h > 0) {
          page.setCropBox(x, y, w, h);
        }
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const outBytes = pdfBytes as unknown as ArrayBuffer;
      outBytesRef.current = outBytes;
      setPreviewBytes(originalBytes.current);

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cropped-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Crop PDF", outBytes.byteLength);
      setSuccess(true);
    } catch { setError("Failed to crop PDF."); }
    setProcessing(false);
  }, [file, top, bottom, left, right, unit, usage]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runCrop();
  }, [runCrop]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Crop PDF - Free Online Tool"
        description="Crop PDF pages online for free. Remove unwanted margins and whitespace from your documents."
        url="https://allaboutpdfediting.xyz/crop"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Crop PDF Margins</h1>
        <p className="text-[var(--muted)]">Remove unwanted whitespace margins from your PDF pages.</p>
      </div>

      <ToolInfo name="Crop PDF" description="Your file stays private. All cropping happens locally in your browser — no uploads, no servers. Remove margins in seconds." />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} />
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
            <span className="text-5xl">✂️</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB &middot; {pageCount} pages</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-5">
            <div className="flex gap-3 mb-2">
              <button onClick={() => setUnit("pt")} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${unit === "pt" ? "bg-indigo-600 text-white" : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>Points</button>
              <button onClick={() => setUnit("mm")} className={`px-5 py-2 rounded-xl text-sm font-medium transition ${unit === "mm" ? "bg-indigo-600 text-white" : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"}`}>Millimeters</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[var(--foreground)] mb-2">Top</label><input type="number" min={0} value={top} onChange={(e) => setTop(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" /></div>
              <div><label className="block text-sm font-medium text-[var(--foreground)] mb-2">Bottom</label><input type="number" min={0} value={bottom} onChange={(e) => setBottom(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" /></div>
              <div><label className="block text-sm font-medium text-[var(--foreground)] mb-2">Left</label><input type="number" min={0} value={left} onChange={(e) => setLeft(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" /></div>
              <div><label className="block text-sm font-medium text-[var(--foreground)] mb-2">Right</label><input type="number" min={0} value={right} onChange={(e) => setRight(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition" /></div>
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCrop(); }} />}

        <ProgressBar processing={processing} fileSize={file?.size} label="Cropping PDF..." />

        {file && (
          <>
            <button
              onClick={process}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Cropping PDF...
                </span>
              ) : "Crop PDF"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB &amp; 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runCrop} onDismiss={() => setError(null)} />}

        {previewBytes && outBytesRef.current && (
          <BeforeAfterPreview beforeBytes={previewBytes} afterBytes={outBytesRef.current} labelBefore="Original" labelAfter="Cropped" />
        )}

        <SuccessAnimation show={success} message="PDF cropped successfully!" />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Crop PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Remove unwanted margins and whitespace from PDF pages online for free. Specify the amount to crop from each side (top, bottom, left, right) in points or millimeters. Perfect for cleaning up scanned documents, removing excessive borders, or fitting content into a smaller area.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. Your original file is never transmitted or stored.</p>
          <p>Keywords: crop PDF online free, trim PDF margins, remove whitespace PDF, cut PDF pages, PDF margin remover free online.</p>
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
