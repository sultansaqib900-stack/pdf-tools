"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium, checkFileSize } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

export default function WatermarkPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(30);
  const [position, setPosition] = useState<"center" | "diagonal" | "bottom">("diagonal");
  const [rotation, setRotation] = useState(45);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => { trackToolVisit("watermark"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, []);

  const runWatermark = useCallback(async () => {
    if (!file || !text.trim()) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const [{ PDFDocument, rgb, StandardFonts, degrees }] = await Promise.all([
        import("pdf-lib"),
      ]);
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const size = Math.min(width, height) / 6;
        page.drawText(text.toUpperCase(), {
          x: position === "bottom" ? width / 4 : width / 6,
          y: position === "bottom" ? height / 6 : height / 2.5,
          size,
          font,
          color: rgb(0.8, 0.2, 0.2),
          opacity: opacity / 100,
          rotate: degrees(position === "bottom" ? 0 : rotation),
        });
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watermarked-${file.name}`;
      a.click();
      trackExport(file.name, "Watermark PDF", bytes.byteLength);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to watermark PDF.");
    }
    setProcessing(false);
  }, [file, text, opacity, position, rotation]);

  const watermark = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runWatermark();
  }, [runWatermark]);

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
        name="Watermark PDF - Free Online Tool"
        description="Add watermark to PDF files online for free. Add text watermarks to protect your documents."
        url="https://allaboutpdfediting.xyz/watermark"
      />
      <HowToJsonLd name="Add Watermark to PDF" description="Add text or image watermarks to every page of a PDF" steps={[{name:"Upload PDF",text:"Select the PDF to watermark"},{name:"Customize watermark",text:"Enter text adjust opacity size and position"},{name:"Download watermarked PDF",text:"Download the PDF with watermarks applied"}]} />
      <AiSummaryJsonLd name="Watermark PDF" summary="Add custom text watermarks to every page of PDF documents" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Text watermark","Opacity control","Position selection","Batch watermarking","Free tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Add Watermark to PDF</h1>
        <p className="text-[var(--muted)]">Add text watermarks to every page of your PDF.</p>
      </div>

      <ToolInfo
        name="PDF Watermark"
        description="Your file stays private. Watermarking happens locally in your browser — no uploads, no servers. Add text such as 'CONFIDENTIAL' or 'DRAFT' across your document pages."
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
            <span className="text-5xl">💧</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Any PDF up to 10MB</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Adding watermark..." />

        {file && (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Watermark Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Opacity: {opacity}%</label>
                <input type="range" min={5} max={80} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition">
                  <option value="center">Center</option>
                  <option value="diagonal">Diagonal</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runWatermark(); }} />}

        {file && (
          <>
            <button
              onClick={watermark}
              disabled={!text.trim() || processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Adding watermark...
                </span>
              ) : "Add Watermark"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB &amp; 5s wait.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runWatermark} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Watermark added!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Watermark PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add text watermarks to PDF documents online for free. Protect your work by marking pages with text like "CONFIDENTIAL", "DRAFT", "DO NOT COPY", or your company name. Customize opacity, position, and rotation to suit your needs.</p>
          <p>All processing happens in your browser using pdf-lib — no uploads, no servers, complete privacy. Use it for internal documents, legal files, or any PDF you want to mark before sharing.</p>
          <p>Keywords: add watermark to PDF online free, PDF watermark tool, mark PDF as confidential, draft watermark PDF free online.</p>
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
