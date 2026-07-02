"use client";

import { useState, useCallback, useEffect } from "react";
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
      let doc: any;
      try {
        doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      } catch {
        try {
          doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
        } catch {
          setError("Could not repair this PDF. The file may be severely corrupted.");
          setProcessing(false); return;
        }
      }
      setProgress("Rebuilding PDF...");
      const repairedBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([repairedBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `repaired-${file.name}`; a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Repair PDF", repairedBytes.byteLength);
      setSuccess(true);
    } catch {
      setError("Repair failed. The file may be too corrupted to fix.");
    }
    setProcessing(false);
  }, [file]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
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
      <SoftwareAppJsonLd name="Repair PDF - Free Online PDF Repair" description="Fix corrupted PDF files online for free." url="https://allaboutpdfediting.xyz/repair-pdf" />
      <HowToJsonLd name="Repair PDF" description="Fix corrupted PDF documents" steps={[{name:"Upload PDF",text:"Select a corrupted PDF file"},{name:"Repair",text:"Rebuild the PDF structure"},{name:"Download",text:"Download your repaired PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Repair PDF", item: "https://allaboutpdfediting.xyz/repair-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Repair PDF" summary="Fix corrupted PDF files by rebuilding their internal structure" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["PDF repair","Corruption fix","Structure rebuild","Client-side processing"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Repair PDF</h1>
        <p className="text-[var(--muted)]">Fix corrupted or damaged PDF files.</p>
      </div>
      <ToolInfo name="Repair PDF" description="Fix corrupted PDF files by rebuilding their internal structure. All processing happens in your browser." />
      <AdBanner className="mb-8" />
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
          {processing ? "Repairing..." : "Repair PDF"}
        </button>
        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">Upgrade for 100MB</a>
          </p>
        )}
        {error && <ErrorBanner message={error} onRetry={runRepair} onDismiss={() => setError(null)} />}
        <SuccessAnimation show={success} message="PDF repaired!" />
      </div>
      <AdBanner className="mt-8" />
      <RelatedContent slug="repair-pdf" />
      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
