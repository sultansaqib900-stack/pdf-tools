"use client";

import { useState, useCallback, useEffect } from "react";
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
import { downloadBytes, isPdfFile } from "@/lib/pdfBytes";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("pdf-to-pdfa");

export default function PdfToPdfaPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => { trackToolVisit("pdf-to-pdfa"); }, []);

  const runConvert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress("Loading PDF...");
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      if (!isPdfFile(file)) throw new Error("Please select a valid PDF file.");
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      setProgress("Adding PDF/A-2B identifiers, XMP, and sRGB output intent…");
      doc.convertToPDFA({ conformance: "2B" });
      const pdfBytes = await doc.save({ useObjectStreams: true });
      downloadBytes(pdfBytes, file.name.replace(/\.pdf$/i, "-pdfa.pdf"));
      trackExport(file.name, "PDF to PDF/A-2B", pdfBytes.byteLength);
      setSuccess(true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Conversion failed.");
    } finally {
      setProcessing(false);
    }
  }, [file]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!isPdfFile(f)) { setError("Please upload a PDF file."); return; }
    setFile(f); setError(null); setSuccess(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0] || null);
  }, [handleFile]);

  const convert = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
    }, [usage, upsell, runConvert])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="PDF to PDF/A - Free Online Converter" description="Convert PDF to PDF/A archive format for long-term preservation." url="https://allaboutpdfediting.xyz/pdf-to-pdfa" />
      <HowToJsonLd name="PDF to PDF/A" description="Convert PDFs to PDF/A archive format" steps={[{name:"Upload PDF",text:"Select a PDF file"},{name:"Convert",text:"Convert to PDF/A archive format"},{name:"Download",text:"Download your archived PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF to PDF/A", item: "https://allaboutpdfediting.xyz/pdf-to-pdfa" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="PDF to PDF/A" summary="Convert PDF documents to PDF/A format for long-term archival and preservation" category="Convert" inputType="PDF" outputType="PDF/A" processing="client-side" price="free" features={["PDF to PDF/A conversion","Archive format","Long-term preservation","Metadata embedding"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">PDF to PDF/A</h1>
        <p className="text-[var(--muted)]">Convert PDF to PDF/A archive format for long-term preservation.</p>
      </div>
      <ToolInfo name="PDF to PDF/A-2B" description="Adds the PDF/A-2B document ID, synchronized XMP metadata, PDF/A identification, and an embedded sRGB output intent entirely in your browser." />
      <p className="mb-4 text-xs text-[var(--muted)]">Existing content is preserved. For regulated archives, validate the result with a PDF/A validator because source PDFs with unembedded fonts or non-compliant content may still require specialist remediation.</p>
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--background)]"}`}>
          <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📦</span>
            <span className="text-indigo-500 font-medium hover:underline">{file ? file.name : "Click to select a PDF"}</span>
          </label>
        </div>
        <ProgressBar processing={processing} fileSize={file?.size || 0} label={progress} />
        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}
        <button onClick={convert} disabled={!file || processing || showTimer}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm">
          {processing ? "Converting..." : "Convert to PDF/A"}
        </button>
        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">Upgrade for 100MB</a>
          </p>
        )}
        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}
        <SuccessAnimation show={success} message="PDF/A created!" />
      </div>
      <RelatedContent slug="pdf-to-pdfa" />
      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
