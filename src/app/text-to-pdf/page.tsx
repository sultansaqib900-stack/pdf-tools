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
import { downloadBytes, validatePdfOutput, formatPdfErrorMessage, sanitizeForStandardFont } from "@/lib/pdfBytes";

import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
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
    if (!canProceed) { setProcessing(false); upsell.showUpsell("trial-limit"); return; }
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

      const safeText = sanitizeForStandardFont(text);
      const safeTitle = sanitizeForStandardFont(title);

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

      for (const logicalLine of safeText.replace(/\r\n?/g, "\n").split("\n")) {
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
        if (pageIndex === 0 && safeTitle) {
          const requestedTitleSize = 18;
          const titleWidth = font.widthOfTextAtSize(safeTitle, requestedTitleSize);
          const titleSize = Math.max(8, Math.min(requestedTitleSize, requestedTitleSize * maxWidth / Math.max(titleWidth, 1)));
          page.drawText(safeTitle, { x: margin, y, size: titleSize, font, color: rgb(0, 0, 0) });
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
      const validation = await validatePdfOutput(pdfBytes);
      if (!validation.ok) {
        throw new Error(validation.error || "Generated document is invalid.");
      }

      const filename = safeTitle ? `${safeTitle.toLowerCase().replace(/\s+/g, "-")}.pdf` : "text-to-pdf.pdf";
      downloadBytes(pdfBytes, filename);
      trackExport(filename, "Text to PDF", pdfBytes.length);
      setSuccess(true);
    } catch (conversionError) {
      setError(formatPdfErrorMessage(conversionError, "Failed to convert text to PDF."));
    } finally {
      setProcessing(false);
    }
  }, [text, title, usage, upsell, trackExport]);

  const process = useCallback(async () => {
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("trial-limit"); return; }
      setShowTimer(true);
      return;
    }
    runConvert();
  }, [usage, upsell, runConvert]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Text to PDF - Free Online Converter"
        description="Convert plain text to a formatted PDF document online for free. Type or paste text and generate a clean PDF instantly."
        url="https://allaboutpdfediting.xyz/text-to-pdf"
      />
      <HowToJsonLd name="Convert Text to PDF Online" description="Convert plain text to a formatted PDF document" steps={[{name:"Enter text",text:"Type or paste your text into the editor"},{name:"Set title (optional)",text:"Add a title for your PDF document"},{name:"Convert",text:"Click convert and download your formatted PDF"}]} />
      <Breadcrumbs items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "Text to PDF", item: "https://allaboutpdfediting.xyz/text-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Text to PDF" summary="Convert typed or pasted plain text into clean, formatted, paginated PDF documents" category="Utilities" inputType="Text" outputType="PDF" processing="client-side" price="free" features={["Plain text conversion","Optional title header","Auto-pagination","Instant processing","No file uploads"]} limits="Up to 100,000 characters" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Text to PDF</h1>
        <p className="text-[var(--muted)]">Type or paste text to generate a clean, formatted PDF document.</p>
      </div>

      <ToolInfo
        name="Text to PDF"
        description="Your text stays private. Conversion happens locally in your browser — no uploads, no servers. Type or paste any text and download it as a formatted PDF."
        acceptedTypes="Plain text / UTF-8"
        maxSize="Up to 100,000 characters"
      />

      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} tier={usage.tier} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Document Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Document"
              className="w-full px-4 py-2 border border-[var(--card-border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Text Content</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={12}
              className="w-full px-4 py-3 border border-[var(--card-border)] rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-indigo-500 text-sm font-mono resize-y"
            />
            <div className="flex justify-between text-xs text-[var(--muted)] mt-1">
              <span>{text.length.toLocaleString()} characters</span>
              <span>~{Math.max(1, Math.ceil(text.length / 3000))} page(s)</span>
            </div>
          </div>
        </div>

        <ProgressBar processing={processing} label="Generating PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={process}
          disabled={!text.trim() || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? "Generating..." : "Generate PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free and unlimited.{" "}
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for batch tools &amp; 100MB files</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onRetry={runConvert} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF generated successfully!" />
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About Text to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert plain text into clean, professional PDF documents right in your browser. Whether you need to export notes, format code snippets, or create a printable document from scratch, Text to PDF handles auto-wrapping, pagination, and margin layout with zero server uploads.</p>
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
