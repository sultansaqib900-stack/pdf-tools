"use client";

import { useState, useCallback, useEffect } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
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

export default function WordToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => { trackToolVisit("word-to-pdf"); }, []);

  const runConvert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress("Reading Word document...");
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml({ buffer: bytes as any });
      setProgress("Creating PDF...");
      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const lines = html.replace(/<[^>]+>/g, "").split("\n").filter((l) => l.trim());
      const page = doc.addPage([612, 792]);
      let y = 750;
      const fontSize = 11;
      for (const line of lines) {
        if (y < 40) { doc.addPage([612, 792]); y = 750; }
        const isBold = line.startsWith("<h") || line.startsWith("<b>");
        page.drawText(line.trim(), { x: 50, y, size: fontSize, font: isBold ? boldFont : font });
        y -= fontSize + 4;
      }
      const pdfBytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes.slice()], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name.replace(/\.(docx|doc)$/i, ".pdf"); a.click();
      URL.revokeObjectURL(url);
      trackExport(file.name, "Word to PDF", pdfBytes.byteLength);
    } catch {
      setError("Conversion failed. Try a different document.");
    }
    setProcessing(false);
    setProgress("");
  }, [file]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.name.match(/\.(docx|doc)$/i)) { setError("Please upload a Word document (.docx)."); return; }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
    setFile(f); setError(null);
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
      <SoftwareAppJsonLd name="Word to PDF - Free Online Converter" description="Convert Word (DOCX) to PDF online for free." url="https://allaboutpdfediting.xyz/word-to-pdf" />
      <HowToJsonLd name="Word to PDF" description="Convert Word documents to PDF" steps={[{name:"Upload DOCX",text:"Select a Word document"},{name:"Convert",text:"Convert to PDF instantly"},{name:"Download",text:"Download your PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Word to PDF", item: "https://allaboutpdfediting.xyz/word-to-pdf" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="Word to PDF" summary="Convert Word DOCX documents to PDF format" category="Convert" inputType="DOCX" outputType="PDF" processing="client-side" price="free" features={["DOCX to PDF conversion","Format preservation","Client-side processing"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Word to PDF</h1>
        <p className="text-[var(--muted)]">Convert Word (DOCX) documents to PDF.</p>
      </div>
      <ToolInfo name="Word to PDF" description="Convert Word documents to PDF entirely in your browser. No uploads, no servers." />
      <AdBanner className="mb-8" />
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--background)]"}`}>
          <input type="file" accept=".docx,.doc" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-3">
            <span className="text-5xl">📝</span>
            <span className="text-indigo-500 font-medium hover:underline">{file ? file.name : "Click to select a Word document"}</span>
          </label>
        </div>
        <ProgressBar processing={processing} fileSize={file?.size || 0} label={progress} />
        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}
        <button onClick={convert} disabled={!file || processing || showTimer}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm">
          {processing ? "Converting..." : "Convert to PDF"}
        </button>
        {!isPremium() && (
          <p className="text-center text-xs text-[var(--muted)]">
            Free users limited to 10MB files.<a href="/premium" className="text-indigo-500 font-medium hover:underline ml-1">Upgrade for 100MB</a>
          </p>
        )}
        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}
      </div>
      <AdBanner className="mt-8" />
      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
