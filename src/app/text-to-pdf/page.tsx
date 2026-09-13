"use client";

import { useState, useCallback, useEffect } from "react";
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
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import { getRelatedContent } from "@/lib/related-content";

const rc = getRelatedContent("text-to-pdf");

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

      const lines: string[] = [];
      const splitLongWord = (word: string): string[] => {
        const parts: string[] = [];
        let part = "";
        for (const character of Array.from(word)) {
          const candidate = part + character;
          if (part && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
            parts.push(part);
            part = character;
          } else {
            part = candidate;
          }
        }
        if (part) parts.push(part);
        return parts;
      };

      for (const logicalLine of text.replace(/\r\n?/g, "\n").split("\n")) {
        if (!logicalLine.trim()) {
          lines.push("");
          continue;
        }
        let line = "";
        for (const word of logicalLine.trim().split(/\s+/)) {
          const segments = font.widthOfTextAtSize(word, fontSize) > maxWidth ? splitLongWord(word) : [word];
          for (const segment of segments) {
            const candidate = line ? `${line} ${segment}` : segment;
            if (line && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
              lines.push(line);
              line = segment;
            } else {
              line = candidate;
            }
          }
        }
        lines.push(line);
      }

      let lineIndex = 0;
      let pageIndex = 0;
      while (lineIndex < lines.length) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin - 20;
        if (pageIndex === 0 && title) {
          const requestedTitleSize = 18;
          const titleWidth = font.widthOfTextAtSize(title, requestedTitleSize);
          const titleSize = Math.max(8, Math.min(requestedTitleSize, requestedTitleSize * maxWidth / Math.max(titleWidth, 1)));
          page.drawText(title, { x: margin, y, size: titleSize, font, color: rgb(0, 0, 0) });
          y -= 36;
        }
        while (lineIndex < lines.length && y >= margin) {
          if (lines[lineIndex]) {
            page.drawText(lines[lineIndex], { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
          }
          lineIndex += 1;
          y -= lineHeight;
        }
        pageIndex += 1;
      }

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title ? `${title.toLowerCase().replace(/\s+/g, "-")}.pdf` : "text-to-pdf.pdf";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      trackExport(title ? `${title.toLowerCase().replace(/\s+/g, "-")}.pdf` : "text-to-pdf.pdf", "Text to PDF", pdfBytes.length);
      setSuccess(true);
    } catch (conversionError) { setError(conversionError instanceof Error ? `Failed to convert text: ${conversionError.message}` : "Failed to convert text."); }
    setProcessing(false);
  }, [text, title]);

  const process = useCallback(async () => {
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
      <SoftwareAppJsonLd
        name="Text to PDF - Free Online Converter"
        description="Convert plain text to PDF online for free. Create PDF documents from text in your browser."
        url="https://allaboutpdfediting.xyz/text-to-pdf"
      />
      <HowToJsonLd name="Convert Text to PDF" description="Convert entered plain text into a paginated PDF" steps={[{name:"Enter or paste text",text:"Type or paste text supported by the standard PDF Helvetica encoding"},{name:"Add optional title",text:"Optionally enter a title for the first page"},{name:"Download PDF",text:"Download the automatically wrapped and paginated PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Text to PDF", item: "https://allaboutpdfediting.xyz/text-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Text to PDF" summary="Convert entered text into a US Letter PDF with measured wrapping and automatic page breaks" category="Utilities" inputType="Text" outputType="PDF" processing="client-side" price="free" features={["Optional title","Measured word wrapping","Explicit line breaks","Automatic pagination","Client-side"]} limits="Uses standard PDF Helvetica and its character encoding" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Text to PDF</h1>
        <p className="text-[var(--muted)]">Convert plain text into a downloadable PDF document instantly.</p>
      </div>

      <ToolInfo name="Text to PDF" description="Your text stays private. Conversion happens locally in your browser — no uploads, no servers. Type or paste any text and download it as a formatted PDF." />

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


      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Text to PDF Converter</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert plain text to PDF documents online for free. Type or paste your content, add an optional title, and download a formatted PDF. Perfect for creating quick notes, saving chat conversations, or turning text files into a professional document format.</p>
          <p>All processing happens locally in your browser — no uploads, no servers, complete privacy. The tool handles long text automatically with page breaks and word wrapping.</p>
          <p>Keywords: text to PDF converter online free, convert text to PDF, plain text to PDF document, create PDF from text online free.</p>
        </div>
      </div>
      <RelatedContent slug="text-to-pdf" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
