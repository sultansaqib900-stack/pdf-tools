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

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";

export default function RotatePage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => { trackToolVisit("rotate"); }, []);

  const handleFile = useCallback(async (f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
    const bytes = await f.arrayBuffer();
    originalBytes.current = bytes;
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    setPageCount(pdf.getPageCount());
  }, []);

  const runRotate = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        const current = page.getRotation().angle;
        page.setRotation(degrees(current + rotation));
      }
      const rotatedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([rotatedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Rotate PDF", rotatedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Failed to rotate PDF.");
    }
    setProcessing(false);
  }, [file, rotation]);

  const rotate = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runRotate();
    }, [usage, upsell, runRotate])

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
        name="Rotate PDF - Free Online Tool"
        description="Rotate PDF pages online for free. Change page orientation to portrait or landscape in your browser."
        url="https://allaboutpdfediting.xyz/rotate"
      />
      <HowToJsonLd name="Rotate PDF Pages" description="Rotate PDF pages by 90 180 or 270 degrees" steps={[{name:"Upload PDF",text:"Select the PDF with pages to rotate"},{name:"Select rotation",text:"Choose 90 180 or 270 degree rotation"},{name:"Download rotated PDF",text:"Download the PDF with corrected page orientation"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Rotate PDF", item: "https://allaboutpdfediting.xyz/rotate" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="Rotate PDF" summary="Rotate PDF pages by 90 180 or 270 degrees to fix orientation issues" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page rotation","90 180 270 degrees","Orientation fix","Free online tool","Client-side only"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Rotate PDF</h1>
        <p className="text-[var(--muted)]">Rotate all pages in a PDF by 90, 180, or 270 degrees.</p>
      </div>

      <ToolInfo
        name="Rotate PDF"
        description="Your PDF never leaves your device. Rotation is applied locally using pdf-lib in your browser — no uploads, no servers. Pick your angle and download the fixed document instantly."
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
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🔄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {pageCount > 0 && <span className="text-sm text-[var(--muted)]">{pageCount} page{pageCount > 1 ? "s" : ""}</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Rotating PDF..." />

        {file && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Rotation angle</label>
              <div className="flex gap-3">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setRotation(angle)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                      rotation === angle
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--card-border)]"
                    }`}
                  >
                    {angle}&deg;
                  </button>
                ))}
              </div>
            </div>

            {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runRotate(); }} />}

            <button
              onClick={rotate}
              disabled={processing || showTimer}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Rotating...
                </span>
              ) : `Rotate all pages ${rotation}°`}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB, batch & no wait</a>
              </p>
            )}

            {error && <ErrorBanner message={error} onRetry={runRotate} onDismiss={() => setError(null)} />}

            <SuccessAnimation show={success} message="Rotation complete!" onRestore={restoreOriginal} />
          </div>
        )}
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Rotate PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Fix upside-down or sideways pages instantly with our rotate PDF tool, the simplest way to correct misaligned documents. Whether you scanned a document at the wrong angle, received a PDF that displays incorrectly, or need to adjust mixed-orientation files, this tool lets you rotate all pages by 90, 180, or 270 degrees in one click. To rotate PDF online free, upload your file, choose your angle, and download the corrected version immediately. All processing happens client-side using pdf-lib, ensuring your files stay private and never leave your device. This is especially helpful when dealing with misaligned scans, rotated camera photos converted to PDF, or any document that needs quick page rotation across the whole file.</p>
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
