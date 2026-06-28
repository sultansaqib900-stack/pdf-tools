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

export default function FlattenPDFPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => { trackToolVisit("flatten-pdf"); }, []);

  const handleFile = useCallback((f: File | null) => {
    if (!f || f.type !== "application/pdf") return;
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f);
    setSuccess(false);
  }, []);

  const runFlatten = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      originalBytes.current = bytes;
      const pdfDoc = await PDFDocument.load(bytes);
      const form = pdfDoc.getForm();
      if (form) form.flatten();
      const flattenedBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([flattenedBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flattened-${file.name}`;
      a.click();
      trackExport(file.name, "Flatten PDF", flattenedBytes.length);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch {
      setError("Failed to flatten. The PDF may not contain form fields or layers.");
    }
    setProcessing(false);
  }, [file]);

  const flatten = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runFlatten();
    }, [usage, upsell, runFlatten])

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
        name="Flatten PDF - Free Online Tool"
        description="Flatten PDF files online for free. Merge form fields annotations and layers into permanent content."
        url="https://allaboutpdfediting.xyz/flatten-pdf"
      />
      <HowToJsonLd name="Flatten PDF Online" description="Merge form fields annotations and layers into permanent page content" steps={[{name:"Upload PDF",text:"Select the PDF with form fields or layers to flatten"},{name:"Flatten document",text:"The tool merges all interactive elements into page content"},{name:"Download flattened PDF",text:"Download the PDF with permanently flattened content"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Flatten PDF", item: "https://allaboutpdfediting.xyz/flatten-pdf" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="Flatten PDF" summary="Merge form fields annotations and layers into permanent PDF page content" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Form flattening","Annotation merge","Layer flattening","Permanent content","Free tool"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Flatten PDF</h1>
        <p className="text-[var(--muted)]">Merge form fields, annotations, and layers into the page content.</p>
      </div>

      <ToolInfo
        name="Flatten PDF"
        description="Your file stays private. All processing happens locally in your browser using pdf-lib — no uploads, no servers. Flatten your PDF to make form fields and annotations permanent, then download instantly."
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
            <span className="text-5xl">📄</span>
            <span className="text-indigo-500 font-medium hover:underline">
              {file ? file.name : "Click to select or drag & drop a PDF"}
            </span>
            {file && <span className="text-sm text-[var(--muted)]">{(file.size / 1024).toFixed(1)} KB</span>}
            {!file && <span className="text-xs text-[var(--muted)]">PDF with form fields or layers</span>}
          </label>
        </div>

        <ProgressBar processing={processing} fileSize={file?.size} label="Flattening PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runFlatten(); }} />}

        {file && (
          <>
            <button
              onClick={flatten}
              disabled={processing || showTimer}
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Flattening PDF...
                </span>
              ) : "Flatten PDF"}
            </button>

            {!isPremium() && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Free users limited to 10MB files.{ " " }
                <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for 100MB & no wait</a>
              </p>
            )}
          </>
        )}

        {error && <ErrorBanner message={error} onRetry={runFlatten} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF flattened successfully!" onRestore={restoreOriginal} />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Flatten PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Flatten a PDF to merge form fields, annotations, comments, and layers into the page content. Once flattened, the content becomes permanent and cannot be edited. This is useful for finalizing filled forms, locking annotations, or preparing documents for printing.</p>
          <p>All processing happens in your browser using pdf-lib — no uploads, no servers, complete privacy. Upload your PDF and download the flattened version instantly.</p>
          <p>Keywords: flatten PDF online free, merge layers in PDF, flatten form fields, make PDF permanent, flatten annotations.</p>
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
