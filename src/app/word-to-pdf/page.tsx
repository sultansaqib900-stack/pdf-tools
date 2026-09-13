"use client";

import { useState, useCallback, useEffect } from "react";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import ProgressBar from "@/components/ProgressBar";
import ErrorBanner from "@/components/ErrorBanner";
import SuccessAnimation from "@/components/SuccessAnimation";
import { downloadBytes } from "@/lib/pdfBytes";
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

const rc = getRelatedContent("word-to-pdf");

function normalizeStandardFontText(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapPdfText(text: string, maxWidth: number, fontSize: number, font: { widthOfTextAtSize(value: string, size: number): number }): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      current = word;
      continue;
    }
    let piece = "";
    for (const character of word) {
      if (piece && font.widthOfTextAtSize(piece + character, fontSize) > maxWidth) {
        lines.push(piece);
        piece = character;
      } else {
        piece += character;
      }
    }
    current = piece;
  }
  if (current) lines.push(current);
  return lines;
}

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
  const [success, setSuccess] = useState(false);

  useEffect(() => { trackToolVisit("word-to-pdf"); }, []);

  const runConvert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setSuccess(false);
    setError(null);
    setProgress("Reading Word document...");
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const mammoth = await import("mammoth");
      const bytes = await file.arrayBuffer();
      const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer: bytes });
      if (!html.trim()) throw new Error("No readable content was found in this DOCX file.");
      setProgress("Laying out PDF pages...");
      const parsedHtml = new DOMParser().parseFromString(html, "text/html");
      const blockElements = Array.from(parsedHtml.body.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,tr"));
      const blocks = blockElements
        .map((element) => ({
          text: normalizeStandardFontText(element.textContent || ""),
          heading: /^H[1-6]$/.test(element.tagName),
          listItem: element.tagName === "LI",
        }))
        .filter((block) => block.text);
      if (blocks.length === 0) throw new Error("No readable paragraphs were found in this DOCX file.");

      const { PDFDocument, StandardFonts } = await import("pdf-lib");
      const document = await PDFDocument.create();
      const regularFont = await document.embedFont(StandardFonts.Helvetica);
      const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
      let currentPage = document.addPage([612, 792]);
      let y = 744;
      const margin = 50;
      const maxWidth = 612 - margin * 2;

      for (const block of blocks) {
        const fontSize = block.heading ? 16 : 11;
        const selectedFont = block.heading ? boldFont : regularFont;
        const prefix = block.listItem ? "- " : "";
        const lines = wrapPdfText(prefix + block.text, maxWidth, fontSize, selectedFont);
        for (const line of lines) {
          const lineHeight = fontSize * 1.35;
          if (y - lineHeight < 42) {
            currentPage = document.addPage([612, 792]);
            y = 744;
          }
          currentPage.drawText(line, { x: margin, y, size: fontSize, font: selectedFont });
          y -= lineHeight;
        }
        y -= block.heading ? 7 : 4;
      }

      const pdfBytes = await document.save({ useObjectStreams: true });
      downloadBytes(pdfBytes, file.name.replace(/\.docx$/i, ".pdf"));
      trackExport(file.name, "Word to PDF", pdfBytes.byteLength);
      setSuccess(true);
      if (messages.length > 0) setProgress(`Converted with ${messages.length} DOCX compatibility notice${messages.length === 1 ? "" : "s"}.`);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Conversion failed. Try a different document.");
    } finally {
      setProcessing(false);
      setProgress("");
    }
  }, [file, trackExport, upsell, usage]);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!/\.docx$/i.test(f.name)) { setError("Please upload a modern Word document (.docx). Legacy .doc files are not supported in the browser."); return; }
    const check = checkFileSize(f.size);
    if (!check.ok) { upsell.showUpsell("file-size"); return; }
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
      <SoftwareAppJsonLd name="Word to PDF - Free Online Converter" description="Convert Word (DOCX) to PDF online for free." url="https://allaboutpdfediting.xyz/word-to-pdf" />
      <HowToJsonLd name="Word to PDF" description="Convert Word documents to PDF" steps={[{name:"Upload DOCX",text:"Select a Word document"},{name:"Convert",text:"Convert to PDF instantly"},{name:"Download",text:"Download your PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Word to PDF", item: "https://allaboutpdfediting.xyz/word-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="Word to PDF" summary="Convert Word DOCX documents to PDF format" category="Convert" inputType="DOCX" outputType="PDF" processing="client-side" price="free" features={["DOCX to PDF conversion","Paragraph and heading layout","Automatic page wrapping","Client-side processing"]} limits="Files up to 10MB" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Word to PDF</h1>
        <p className="text-[var(--muted)]">Convert Word (DOCX) documents to PDF.</p>
      </div>
      <ToolInfo name="Word to PDF" description="Convert DOCX paragraphs, headings, lists, and table text into a clean PDF entirely in your browser. Complex Word layouts may be simplified." />
      <div className="mb-4"><UsageBar remaining={usage.remaining} unlimited={usage.unlimited} /></div>
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 space-y-6">
        <div onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging ? "border-indigo-500 bg-indigo-50/30" : "border-[var(--card-border)] bg-[var(--background)]"}`}>
          <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => handleFile(e.target.files?.[0] || null)} className="hidden" id="fileInput" />
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
        <SuccessAnimation show={success} message="Word document converted and downloaded." />
      </div>
      <RelatedContent slug="word-to-pdf" />
      <PremiumUpsell show={upsell.state.show} mode={upsell.state.mode} message={upsell.state.message} onClose={upsell.hideUpsell} />
    </div>
  );
}
