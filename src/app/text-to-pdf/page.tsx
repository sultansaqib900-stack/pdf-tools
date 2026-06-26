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
import { isPremium } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";

export default function TextToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { trackToolVisit("text-to-pdf"); }, []);

  const runConvert = useCallback(async () => {
    if (!text.trim()) { setError("Enter some text first."); return; }
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 72;
      const pageWidth = 612;
      const pageHeight = 792;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.4;

      const words = text.split(/\s+/);
      let line = "";
      let lines: string[] = [];

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
      const totalPages = Math.ceil(lines.length / linesPerPage);

      let lineIdx = 0;
      for (let p = 0; p < totalPages; p++) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        if (p === 0 && title) {
          page.drawText(title, { x: margin, y: pageHeight - margin - 20, size: 18, font, color: rgb(0, 0, 0) });
        }
        let y = pageHeight - margin - (title && p === 0 ? 50 : 20);
        for (let i = 0; i < linesPerPage && lineIdx < lines.length; i++, lineIdx++) {
          page.drawText(lines[lineIdx], { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
          y -= lineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title ? `${title.toLowerCase().replace(/\s+/g, "-")}.pdf` : "text-to-pdf.pdf";
      a.click();
      URL.revokeObjectURL(url);
      trackExport(title ? `${title.toLowerCase().replace(/\s+/g, "-")}.pdf` : "text-to-pdf.pdf", "Text to PDF", pdfBytes.length);
      setSuccess(true);
    } catch { setError("Failed to convert text."); }
    setProcessing(false);
  }, [text, title]);

  const process = useCallback(async () => {
    if (!isPremium()) { setShowTimer(true); return; }
    runConvert();
  }, [runConvert]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Text to PDF - Free Online Converter"
        description="Convert plain text to PDF online for free. Create PDF documents from text in your browser."
        url="https://allaboutpdfediting.xyz/text-to-pdf"
      />
      <HowToJsonLd name="Convert Text to PDF" description="Convert plain text to formatted PDF documents" steps={[{name:"Enter or paste text",text:"Type or paste your text content"},{name:"Choose formatting",text:"Select font size and page layout"},{name:"Download PDF",text:"Download your text as a formatted PDF document"}]} />
      <AiSummaryJsonLd name="Text to PDF" summary="Convert plain text content into formatted PDF documents" category="Utilities" inputType="Text" outputType="PDF" processing="client-side" price="free" features={["Text conversion","Font selection","Page formatting","Free online tool","Client-side"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Text to PDF</h1>
        <p className="text-[var(--muted)]">Convert plain text into a downloadable PDF document instantly.</p>
      </div>

      <ToolInfo name="Text to PDF" description="Your text stays private. Conversion happens locally in your browser — no uploads, no servers. Type or paste any text and download it as a formatted PDF." />

      <AdBanner className="mb-8" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Document Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Document"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Your Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none focus:border-indigo-500 transition resize-y"
          />
          <p className="text-xs text-[var(--muted)] mt-1">{text.length.toLocaleString()} characters</p>
        </div>

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <ProgressBar processing={processing} fileSize={undefined} label="Converting to PDF..." />

        <button
          onClick={process}
          disabled={!text.trim() || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Converting to PDF...
            </span>
          ) : "Convert to PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users have a 5s wait.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for instant processing</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF created successfully!" />
      </div>

      <AdBanner className="mt-8" />

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Text to PDF Converter</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert plain text to PDF documents online for free. Type or paste your content, add an optional title, and download a formatted PDF. Perfect for creating quick notes, saving chat conversations, or turning text files into a professional document format.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. The tool handles long text automatically with page breaks and word wrapping.</p>
          <p>Keywords: text to PDF converter online free, convert text to PDF, plain text to PDF document, create PDF from text online free.</p>
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
