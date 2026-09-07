"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import ToolShell from "@/components/ui/ToolShell";
import DropZone from "@/components/ui/DropZone";
import Icon from "@/components/ui/Icon";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";
import UseCaseLinks from "@/components/UseCaseLinks";

const rc = getRelatedContent("compress");

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
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runCompress();
    }, [usage, upsell, file, runCompress])

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
    <ToolShell
      icon="compress"
      title="Compress PDF"
      lead="Reduce PDF file size while keeping the document readable. Runs entirely in your browser."
    >
      <SoftwareAppJsonLd
        name="PDF Compressor - Free Online PDF Tool"
        description="Compress PDF files online for free. Reduce PDF file size without losing quality. No uploads, 100% private, all in your browser."
        url="https://allaboutpdfediting.xyz/compress"
      />
      <HowToJsonLd name="Compress PDF Online Free" description="Reduce PDF file size without losing quality" steps={[{name:"Upload PDF",text:"Select the PDF file you want to compress"},{name:"Choose compression level",text:"Select compression level low medium or high"},{name:"Download compressed PDF",text:"Download your smaller PDF file"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Compress PDF", item: "https://allaboutpdfediting.xyz/compress" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Compress PDF" summary="Reduce PDF file size instantly without losing quality" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Lossless compression","Size reduction","Quality preservation","Instant processing","No uploads"]} limits="Files up to 10MB" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <DropZone
          file={file}
          onFile={handleFile}
          hint={isPremium() ? "PDF up to 100 MB" : "PDF up to 10 MB"}
        />

        <ProgressBar processing={processing} fileSize={file?.size} label="Compressing PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runCompress(); }} />}

        <button
          onClick={compress}
          disabled={!file || processing || showTimer}
          className="btn btn-primary btn-lg w-full mt-4"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Compressing
            </>
          ) : "Compress PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-[0.75rem] text-[var(--muted)]">
            Free tier is limited to 10 MB.{" "}
            <a href="/premium" className="font-medium text-[var(--accent)] hover:underline">
              Upgrade for 100 MB and batch processing
            </a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runCompress} onDismiss={() => setError(null)} />}

        {result && !processing && (() => {
          const pct = Math.max(0, Math.round((1 - result.size / result.originalSize) * 100));
          return (
            <div className="mt-4 p-4 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface-subtle)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.875rem] font-medium text-[var(--foreground)]">Result</p>
                <span className="badge" style={{ color: "var(--success)" }}>
                  <Icon name="check" size={11} />
                  {pct}% smaller
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between text-[0.8125rem] tabular-nums">
                <span className="text-[var(--muted)]">{formatBytes(result.originalSize)}</span>
                <Icon name="arrowRight" size={13} className="text-[var(--muted)]" />
                <span className="font-medium text-[var(--foreground)]">{formatBytes(result.size)}</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--success)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })()}

        <SuccessAnimation
          show={success}
          message="Compression complete"
          details={`${formatBytes(result?.originalSize || 0)} → ${formatBytes(result?.size || 0)}`}
          onRestore={restoreOriginal}
        />
      </div>

      <section className="mt-10 pt-8 border-t border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">About this tool</h2>
        <p className="text-[0.875rem] leading-relaxed text-[var(--muted-strong)]">
          This compressor reduces PDF size by removing redundant objects and optimising
          object streams with pdf-lib. How much you save depends on the document —
          image-heavy files shrink the most, while text-only PDFs are already compact.
          Everything runs client-side, so your file is never uploaded and nothing is
          stored on our servers.
        </p>
      </section>

      <RelatedContent slug="compress" />

      <UseCaseLinks toolSlug="compress" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </ToolShell>
  );
}
