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

export default function CompressPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ size: number; originalSize: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("compress"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (f && f.type === "application/pdf") {
      const check = checkFileSize(f.size);
      if (!check.ok) { upsell.showUpsell("file-size"); return; }
      setFile(f);
      setResult(null);
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

  const runCompress = useCallback(async () => {
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
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        objectsPerTick: 100,
      });
      const compressed = new Uint8Array(compressedBytes);
      setResult({ size: compressed.length, originalSize: bytes.byteLength });

      const blob = new Blob([compressed.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Compress PDF", compressed.length);
      setSuccess(true);
    } catch {
      setError("Failed to compress PDF. The file may be encrypted or corrupted.");
    }
    setProcessing(false);
  }, [file, usage]);

  const compress = useCallback(async () => {
    if (!file) return;
    if (!isPremium()) { setShowTimer(true); return; }
    runCompress();
  }, [file, runCompress]);

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

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="PDF Compressor - Free Online PDF Tool"
        description="Compress PDF files online for free. Reduce PDF file size without losing quality. No uploads, 100% private, all in your browser."
        url="https://allaboutpdfediting.xyz/compress"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Compress PDF</h1>
        <p className="text-[var(--muted)]">Reduce PDF file size while maintaining quality.</p>
      </div>

      <ToolInfo
        name="Compress PDF"
        description="Your PDF never leaves your device. All compression happens locally in your browser using pdf-lib. Select a file, click compress, and download the smaller version — no uploads, no servers, no privacy risks."
      />

      <AdBanner className="mb-8" />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} />
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
            <span className="text-5xl">📦</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{formatBytes(file.size)}</span>}
            {!file && <span className="text-xs text-[var(--muted)]">Max 50MB · PDF format only</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Compressing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCompress(); }} />}

        <button
          onClick={compress}
          disabled={!file || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Compressing...
            </span>
          ) : "Compress PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runCompress} onDismiss={() => setError(null)} />}

        {result && !processing && (
          <div className="mt-4 space-y-2">
            <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)]">
              <p className="text-sm font-medium text-[var(--foreground)]">Compression Results</p>
              <div className="flex justify-between mt-2 text-sm text-[var(--muted)]">
                <span>Original: {formatBytes(result.originalSize)}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Compressed: {formatBytes(result.size)}</span>
              </div>
              <div className="mt-2 w-full h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((1 - result.size / result.originalSize) * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                {Math.round((1 - result.size / result.originalSize) * 100)}% smaller
              </p>
            </div>
          </div>
        )}

        <SuccessAnimation show={success} message="Compression complete!" details={`${file ? formatBytes((result?.originalSize || 0)) : ""} → ${file ? formatBytes((result?.size || 0)) : ""}`} onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Compress PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Our free compress PDF tool lets you reduce PDF file size without sacrificing quality, making it easy to email documents or upload to websites. The compression works entirely in your browser using pdf-lib, which removes redundant data and optimizes object streams for maximum efficiency. You can achieve significant compression ratios depending on your file's content — images, fonts, and embedded elements all compress differently. For best results, compress PDF online free before sharing large attachments, as smaller files transfer faster and use less storage. Whether you are reducing scan quality or optimizing a presentation, this tool helps you make a smaller PDF while preserving readability. Since everything runs client-side, your files never leave your device, ensuring complete privacy and security. Try it now and see how much smaller your PDFs can get with just one click — no sign-up, no uploads, no limits.</p>
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
