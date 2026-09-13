"use client";

import { isPdfFile } from "@/lib/pdfBytes";

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
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("repair-pdf");

export default function RepairPdfPage() {
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

  useEffect(() => { trackToolVisit("repair-pdf"); }, []);

  const runRepair = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress("Analyzing PDF structure...");
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      setProgress("Re-serializing readable objects and cross-references...");
      const repairedBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([repairedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `repaired-${file.name}`; a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      trackExport(file.name, "Repair PDF", repairedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("This PDF could not be parsed, so it cannot be re-saved in the browser. Severely corrupted or encrypted files require a dedicated recovery tool.");
    }
    setProcessing(false);
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
    runRepair();
    }, [usage, upsell, runRepair])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd name="Re-save PDF - Browser PDF Structure Rebuilder" description="Re-serialize a readable PDF to rebuild object streams and cross-reference data. It cannot recover files that cannot be parsed." url="https://allaboutpdfediting.xyz/repair-pdf" />
      <HowToJsonLd name="Re-save a Readable PDF" description="Parse and re-serialize a readable PDF into a fresh byte stream" steps={[{name:"Upload PDF",text:"Select a PDF that can still be opened"},{name:"Re-save structure",text:"Parse readable objects and write fresh object streams and cross-references"},{name:"Download",text:"Download the re-saved PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Repair PDF", item: "https://allaboutpdfediting.xyz/repair-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Re-save PDF" summary="Parse a readable PDF and re-serialize it with fresh object streams and cross-reference data" category="Utilities" inputType="Readable PDF" outputType="PDF" processing="client-side" price="free" features={["PDF re-serialization","Cross-reference rewrite","Object-stream output","Explicit failure for unreadable files"]} limits="Cannot recover PDFs that pdf-lib cannot parse" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Re-save PDF Structure</h1>
        <p className="text-[var(--muted)]">Re-serialize a readable PDF with fresh object streams and cross-references.</p>
      </div>
      <ToolInfo name="Re-save PDF" description="This is not a forensic recovery engine. It can rewrite a PDF that pdf-lib can parse, which may repair some cross-reference or serialization compatibility issues; it cannot reconstruct unreadable headers or missing objects." />
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--background)]"}`}>
          <input type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">🔧</span>
            <span className="text-indigo-500 font-medium hover:underline">{file ? file.name : "Click to select a PDF"}</span>
          </label>
        </div>
        <ProgressBar processing={processing} fileSize={file?.size || 0} label={progress} />
        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runRepair(); }} />}
        <button onClick={convert} disabled={!file || processing || showTimer}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm">
          {processing ? "Re-saving..." : "Re-save PDF"}
        </button>
        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">Upgrade for 100MB</a>
          </p>
        )}
        {error && <ErrorBanner message={error} onRetry={runRepair} onDismiss={() => setError(null)} />}
        <SuccessAnimation show={success} message="PDF re-saved successfully!" />
      </div>
      <RelatedContent slug="repair-pdf" />
      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
