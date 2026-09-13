"use client";

import { isPdfFile } from "@/lib/pdfBytes";

import { useState, useCallback, useEffect, useRef } from "react";
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
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("watermark");

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
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    trackToolVisit("watermark");
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        const f = new File([pipelineDoc.bytes as unknown as BlobPart], pipelineDoc.name, { type: "application/pdf" });
        setFile(f);
      }
    })();
  }, [trackToolVisit]);

  const handleFile = useCallback((f: File | null) => {
    if (!f || !isPdfFile(f)) return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, [upsell]);

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
      setResultBytes(pdfBytes);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watermarked-${file.name}`;
      a.click();
      trackExport(file.name, "Watermark PDF", bytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to watermark PDF.");
    }
    setProcessing(false);
  }, [file, text, opacity, position, rotation, usage, upsell, trackExport]);

  const watermark = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runWatermark();
  }, [usage, upsell, runWatermark]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `original-${file?.name || "restored.pdf"}`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Watermark PDF - Free Online Tool"
        description="Add text watermarks to PDF files online for free. Customize text, opacity, and position in your browser."
        url="https://allaboutpdfediting.xyz/watermark"
      />
      <HowToJsonLd name="Watermark PDF" description="Add customizable text watermarks to PDF pages" steps={[{name:"Upload PDF",text:"Select the PDF file to watermark"},{name:"Customize watermark",text:"Enter text set opacity rotation and position"},{name:"Apply and download",text:"Click Add Watermark and download your protected PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Watermark PDF", item: "https://allaboutpdfediting.xyz/watermark" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Watermark PDF" summary="Add custom text watermarks to PDF pages with full control over opacity position and rotation" category="UtilitiesApplication" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Custom text watermark","Opacity control","Position and rotation options","Batch page watermarking","Free and private"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">Watermark PDF</h1>
        <p className="text-[var(--muted)]">Add custom text watermarks to your PDF pages.</p>
      </div>

      <ToolInfo
        name="Watermark PDF"
        description="Add a customizable watermark (like 'CONFIDENTIAL' or 'DRAFT') across all pages of your PDF. Runs entirely in your browser — your files never leave your device."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] p-6 sm:p-8 shadow-xl">
        <div
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--background)]"
          }`}
        >
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
            <span className="text-4xl">💧</span>
            <span className="text-indigo-500 font-bold text-sm hover:underline">
              {file ? file.name : "Click to select a PDF"}
            </span>
            <span className="text-xs text-[var(--muted)]">Supports PDF documents up to 10MB</span>
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Adding watermark..." />

        {file && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-1">Watermark Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Opacity: {opacity}%</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Rotation: {rotation}°</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as "center" | "diagonal" | "bottom")}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="diagonal">Diagonal</option>
                  <option value="center">Center</option>
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
              className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/20 active:scale-[0.99]"
            >
              {processing ? "Adding watermark..." : "💧 Apply Watermark & Save"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{" "}
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for no limits</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runWatermark} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="Watermark added successfully!" onRestore={restoreOriginal} />

        {success && (
          <PipelineActionBar
            pdfBytes={resultBytes}
            filename={`watermarked-${file?.name || "document.pdf"}`}
            downloadUrl={downloadUrl}
            currentToolName="Watermark PDF"
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Watermark PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Add text watermarks to PDF documents online for free. Protect your work by marking pages with text like "CONFIDENTIAL", "DRAFT", "DO NOT COPY", or your company name. Customize opacity, position, and rotation to suit your needs.</p>
          <p>All processing happens in your browser using pdf-lib — no uploads, no servers, complete privacy. Use it for internal documents, legal files, or any PDF you want to mark before sharing.</p>
        </div>
      </div>
      <RelatedContent slug="watermark" />

      <UseCaseLinks toolSlug="watermark" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
