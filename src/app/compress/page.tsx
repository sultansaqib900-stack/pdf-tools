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
import PipelineActionBar from "@/components/PipelineActionBar";
import { getPipelineDocument } from "@/lib/pdfPipeline";
import { compressPdfBytes, type PdfCompressionMode } from "@/lib/pdfRaster";
import { copyPdfBytes, createPdfFile, downloadBytes, isPdfFile } from "@/lib/pdfBytes";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("compress");

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function CompressPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ size: number; originalSize: number; flattened: boolean } | null>(null);
  const [compressionMode, setCompressionMode] = useState<PdfCompressionMode>("balanced");
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  useEffect(() => {
    trackToolVisit("compress");
    (async () => {
      const pipelineDoc = await getPipelineDocument();
      if (pipelineDoc && pipelineDoc.bytes) {
        setFile(createPdfFile(pipelineDoc.bytes, pipelineDoc.name));
      }
    })();
  }, [trackToolVisit]);

  const handleFile = useCallback((f: File | null) => {
    if (f && isPdfFile(f)) {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
      setFile(f);
      setResult(null);
      setResultBytes(null);
      setDownloadUrl(null);
      setError(null);
      setSuccess(false);
    } else if (f) {
      setError("Please select a valid PDF file.");
    }
  }, [upsell]);

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

  const runCompress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes.slice(0);
      const compressed = await compressPdfBytes(bytes, compressionMode);
      setResult({ size: compressed.outputSize, originalSize: compressed.originalSize, flattened: compressed.flattened });
      setResultBytes(copyPdfBytes(compressed.bytes));
      downloadBytes(compressed.bytes, `compressed-${file.name}`);
      setDownloadUrl(URL.createObjectURL(new Blob([copyPdfBytes(compressed.bytes).buffer as ArrayBuffer], { type: "application/pdf" })));
      trackExport(file.name, `Compress PDF (${compressionMode})`, compressed.outputSize);
      setSuccess(true);
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Failed to compress PDF. The file may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  }, [compressionMode, file, usage, upsell, trackExport]);

  const compress = useCallback(async () => {
    if (!file) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runCompress();
  }, [usage, upsell, file, runCompress]);

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    downloadBytes(originalBytes.current, `original-${file?.name || "restored.pdf"}`);
  }, [file]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Compress PDF - Free Online PDF Compressor"
        description="Compress PDF files online for free while maintaining quality. Fast, secure, and client-side processing."
        url="https://allaboutpdfediting.xyz/compress"
      />
      <HowToJsonLd name="Compress PDF" description="Reduce PDF size with balanced, maximum, or lossless compression" steps={[{name:"Upload PDF",text:"Select or drop your PDF document"},{name:"Choose a mode",text:"Use visual compression for smaller files or Lossless to preserve interactive content"},{name:"Download",text:"Download the result; the original is kept if compression would make it larger"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Compress PDF", item: "https://allaboutpdfediting.xyz/compress" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Compress PDF" summary="Reduce PDF size in the browser with selectable visual or lossless compression" category="UtilitiesApplication" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Balanced compression","Maximum compression","Lossless optimization","Original retained when already smaller","Private local processing"]} limits="Free and premium file-size limits apply" />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">Compress PDF</h1>
        <p className="text-[var(--muted)]">Choose smaller visual output or lossless document optimization.</p>
      </div>

      <ToolInfo
        name="Compress PDF"
        description="Reduce PDF file size for easy sharing via email or upload. Everything runs in your browser — your files are never uploaded to any server."
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--card-border)] p-6 sm:p-8 shadow-xl">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            dragging ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--background)]"
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
            <span className="text-5xl">📦</span>
            <span className="text-indigo-500 font-bold hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-emerald-600 font-semibold">{formatBytes(file.size)}</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Max 50MB · 100% Private Client-Side</span>}
          </label>
        </div>

        {file && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "balanced" as PdfCompressionMode, label: "Balanced", detail: "Smaller, clear pages" },
              { id: "maximum" as PdfCompressionMode, label: "Maximum", detail: "Smallest output" },
              { id: "lossless" as PdfCompressionMode, label: "Lossless", detail: "Keeps text & forms" },
            ].map((option) => (
              <button key={option.id} type="button" onClick={() => setCompressionMode(option.id)} className={`p-3 rounded-xl border text-left ${compressionMode === option.id ? "border-indigo-500 bg-indigo-500/10" : "border-[var(--card-border)] bg-[var(--background)]"}`}>
                <span className="block text-xs font-bold text-[var(--foreground)]">{option.label}</span>
                <span className="block text-[10px] text-[var(--muted)]">{option.detail}</span>
              </button>
            ))}
          </div>
        )}

        {file && compressionMode !== "lossless" && <p className="mt-2 text-[11px] text-[var(--muted)]">Balanced and Maximum rebuild pages as compressed images, so form fields and selectable text are flattened. Choose Lossless to preserve them.</p>}

        <ProgressBar processing={processing} fileSize={file?.size} label="Compressing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCompress(); }} />}

        {file && (
          <button
            onClick={compress}
            disabled={!file || processing || showTimer}
            className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/20 active:scale-[0.99]"
          >
            {processing ? "Compressing PDF..." : "⚡ Compress PDF Now"}
          </button>
        )}

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{" "}
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch &amp; no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runCompress} onDismiss={() => setError(null)} />}

        {result && !processing && (
          <div className="mt-6 space-y-2">
            <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
              <p className="text-sm font-bold text-[var(--foreground)]">Compression Results</p>
              <div className="flex justify-between mt-2 text-sm text-[var(--muted)]">
                <span>Original: {formatBytes(result.originalSize)}</span>
                <span className="text-emerald-500 font-bold">Compressed: {formatBytes(result.size)}</span>
              </div>
              <div className="mt-2 w-full h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((1 - result.size / result.originalSize) * 100))}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-emerald-500 font-semibold">
                {result.size < result.originalSize ? `🎉 ${Math.round((1 - result.size / result.originalSize) * 100)}% reduction in file size` : "This PDF was already optimized; a larger output was not used."}
              </p>
              {result.flattened && <p className="mt-1 text-[11px] text-[var(--muted)]">Pages were flattened into compressed images for a smaller file.</p>}
            </div>
          </div>
        )}

        <SuccessAnimation show={success} message="Compression complete!" details={`${file ? formatBytes((result?.originalSize || 0)) : ""} → ${file ? formatBytes((result?.size || 0)) : ""}`} onRestore={restoreOriginal} />

        {success && (
          <PipelineActionBar
            pdfBytes={resultBytes}
            filename={`compressed-${file?.name || "document.pdf"}`}
            downloadUrl={downloadUrl}
            currentToolName="Compress PDF"
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Compress PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our PDF compressor offers three honest modes. Balanced and Maximum rebuild pages as optimized images for meaningful reductions on scans and image-heavy documents; Lossless optimizes object streams while preserving selectable text, links, and forms. If an attempted result is larger, the original bytes are kept instead. For best results, compress PDF online free before sharing large attachments, as smaller files transfer faster and use less storage. Whether you are reducing scan quality or optimizing a presentation, this tool helps you make a smaller PDF while preserving readability. Since everything runs client-side, your files never leave your device, ensuring complete privacy and security.</p>
        </div>
      </div>

      <RelatedContent slug="compress" />

      <UseCaseLinks toolSlug="compress" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
