"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AdBanner from "@/components/AdBanner";
import ToolInfo from "@/components/ToolInfo";
import FreeWaitTimer from "@/components/FreeWaitTimer";
import UsageBar from "@/components/UsageBar";
import PremiumUpsell, { usePremiumUpsell } from "@/components/PremiumUpsell";
import { isPremium } from "@/lib/premium";
import { useUsage } from "@/hooks/useUsage";
import { useToolHistory } from "@/hooks/useToolHistory";
import ProgressBar from "@/components/ProgressBar";
import SuccessAnimation from "@/components/SuccessAnimation";
import ErrorBanner from "@/components/ErrorBanner";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import RelatedContent from "@/components/RelatedContent";
import UseCaseLinks from "@/components/UseCaseLinks";
import { getRelatedContent } from "@/lib/related-content";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const rc = getRelatedContent("html-to-pdf");

export default function HtmlToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [html, setHtml] = useState("<h1>Hello World</h1><p>Your content here.</p>");
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackToolVisit("html-to-pdf"); }, []);

  const convert = useCallback(async () => {
    if (!html.trim()) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const container = previewRef.current;
      if (!container) return;

      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pdfW / imgW;
      const pageH = imgH * ratio;
      let heightLeft = pageH;
      let pos = 0;

      pdf.addImage(imgData, "JPEG", 0, pos, pdfW, pageH);
      heightLeft -= pdfH;

      while (heightLeft > 0) {
        pos -= pdfH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, pos, pdfW, pageH);
        heightLeft -= pdfH;
      }

      pdf.save("document.pdf");
      trackExport("html-to-pdf", "HTML to PDF", html.length);
      setSuccess(true);
      setProcessing(false);
    } catch {
      setError("Failed to generate PDF. Check your HTML for errors.");
      setProcessing(false);
    }
  }, [html, usage, upsell]);

  const runConvert = convert;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="HTML to PDF - Free Online Converter"
        description="Convert HTML to PDF online for free. Turn HTML markup into professional PDF documents instantly."
        url="https://allaboutpdfediting.xyz/html-to-pdf"
      />
      <HowToJsonLd name="Convert HTML to PDF" description="Convert HTML markup and web pages to PDF documents" steps={[{name:"Enter HTML",text:"Paste HTML code or enter a URL"},{name:"Preview",text:"Preview how the PDF will look"},{name:"Download PDF",text:"Download the HTML content as a PDF document"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "HTML to PDF", item: "https://allaboutpdfediting.xyz/html-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="HTML to PDF" summary="Convert HTML markup and web page URLs into PDF documents" category="Utilities" inputType="HTML" outputType="PDF" processing="client-side" price="free" features={["HTML conversion","URL to PDF","Preview","Free tool","Client-side processing"]} limits="Files up to 10MB" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">HTML to PDF</h1>
        <p className="text-[var(--muted)]">Convert HTML markup to a downloadable PDF document.</p>
      </div>

      <ToolInfo
        name="HTML to PDF"
        description="Your content stays private. Conversion happens entirely in your browser using html2canvas and jsPDF — no uploads, no servers, no print dialog. Just paste HTML and download your PDF instantly."
      />

      <AdBanner className="mb-8" />
      <div className="mb-4">
        <UsageBar remaining={usage.remaining} unlimited={usage.unlimited} />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Paste your HTML</label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono outline-none focus:border-indigo-500 transition resize-y"
        />

        <div className="mt-4 mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Preview</label>
          <div
            ref={previewRef}
            className="p-4 rounded-xl border border-[var(--card-border)] bg-white min-h-[120px] overflow-auto text-black text-sm leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_img]:max-w-full [&_a]:text-blue-600 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <ProgressBar processing={processing} label="Generating PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={convert}
          disabled={!html.trim() || processing || showTimer}
          className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Generating PDF...
            </span>
          ) : "Download PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users see a 5s wait.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for instant processing</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF downloaded!" onRestore={undefined} />

        {success && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl text-center">
            <p className="text-sm text-green-700 dark:text-green-400">PDF downloaded successfully!</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Tips:</p>
          <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1 list-disc list-inside">
            <li>Use standard HTML tags — h1-h6, p, ul, table, img, div</li>
            <li>External images may not render — use data URIs or inline SVGs</li>
            <li>CSS styles are supported through inline or style tags</li>
            <li>Complex layouts may look different in the PDF preview</li>
          </ul>
        </div>
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About HTML to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert your HTML markup to a polished PDF document with our free tool, ideal for developers, content creators, and documentation authors. Whether you need to save a web page for offline reading, create printable documentation from HTML templates, or generate reports dynamically, our HTML to PDF converter makes it straightforward. To convert HTML to PDF online free, paste your HTML code into the editor and click download — the conversion uses html2canvas and jsPDF in your browser, so everything stays client-side with no data uploaded to any server. Just paste your markup, preview the result, and download your PDF instantly.</p>
        </div>
      </div>
      <RelatedContent slug="html-to-pdf" />
      <UseCaseLinks toolSlug="html-to-pdf" />

      <PremiumUpsell
        show={upsell.state.show}
        mode={upsell.state.mode}
        message={upsell.state.message}
        onClose={upsell.hideUpsell}
      />
    </div>
  );
}
