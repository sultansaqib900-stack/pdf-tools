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
import Link from "next/link";
import ToolShell from "@/components/ui/ToolShell";
import ToolGuide from "@/components/ToolGuide";
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

      <ToolGuide
        summary={
          <>
            <p>
              <strong>To compress a PDF:</strong> drop the file above, choose a compression level and
              download the result. Typical savings run from 30% to 80%. Scanned and image-heavy
              documents shrink the most; a text-only PDF is already compact and may barely change.
            </p>
          </>
        }
        steps={[
          { title: "Add your PDF", body: "Drag the file onto the drop zone or click to browse. The file is read by your browser and is not uploaded." },
          { title: "Pick a compression level", body: "Start with the balanced option. Use stronger compression only if you need to hit a specific size limit, since image quality drops as you push further." },
          { title: "Compress and check the result", body: "You will see the size before and after, and the percentage saved. If a figure or scan now looks too soft, run the original again at a lighter setting." },
          { title: "Download and keep the original", body: "Save the compressed copy for sending and archive the uncompressed original, in case someone later needs to zoom into a diagram." },
        ]}
        sections={[
          {
            heading: "Why your PDF is large in the first place",
            body: (
              <>
                <p>
                  Almost all PDF bulk is images. A page of text is a few kilobytes, while a single
                  scanned page photographed at 300&nbsp;DPI can be several megabytes. If your file is
                  20&nbsp;MB, it is very likely scans, screenshots or embedded photographs rather than
                  the writing.
                </p>
                <p>
                  The other common causes are embedded fonts, which add up when a document uses many
                  typefaces, and accumulated revision data left behind by editing software. Compression
                  addresses redundant objects and inefficient image encoding, which is why results vary
                  so much between documents.
                </p>
              </>
            ),
          },
          {
            heading: "Hitting a specific size limit",
            body: (
              <>
                <p>
                  Most email systems cap attachments between 10&nbsp;MB and 25&nbsp;MB. Court e-filing
                  portals are often stricter, commonly 10&nbsp;MB to 35&nbsp;MB per document, and
                  university submission portals sit around 20&nbsp;MB to 40&nbsp;MB.
                </p>
                <p>
                  If compression alone will not get you under the limit, splitting is usually better
                  than compressing until the document becomes unreadable. Use{" "}
                  <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>{" "}
                  along a logical boundary such as a chapter or exhibit, so each part still makes sense
                  on its own. Removing pages that are not needed with{" "}
                  <Link href="/delete-pages" className="text-[var(--accent)] hover:underline">Delete pages</Link>{" "}
                  is often the quickest win of all.
                </p>
              </>
            ),
          },
          {
            heading: "When compression will not help much",
            body: (
              <>
                <p>
                  A PDF that is mostly text is already close to optimal, and you may see only a few
                  percent. A file that has been compressed once cannot usefully be compressed again —
                  the redundancy has already been removed, and repeated passes mainly degrade images.
                </p>
                <p>
                  If a scanned document needs to stay legible at high zoom, consider running{" "}
                  <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR</Link>{" "}
                  so the text is searchable, which often matters more than raw resolution for how
                  usable the document actually is.
                </p>
              </>
            ),
          },
        ]}
      />

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
