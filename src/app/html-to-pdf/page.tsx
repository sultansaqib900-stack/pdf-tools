"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

function sanitizePreviewHtml(source: string): string {
  if (typeof DOMParser === "undefined") return "";
  const document = new DOMParser().parseFromString(source, "text/html");
  document.querySelectorAll("script, iframe, object, embed, base, meta, link").forEach((element) => element.remove());
  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || ((name === "href" || name === "src") && value.startsWith("javascript:"))) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  return document.body.innerHTML;
}

export default function HtmlToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [html, setHtml] = useState("<h1>Hello World</h1><p>Your content here.</p>");
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { trackToolVisit("html-to-pdf"); }, []);
  useEffect(() => { setSanitizedHtml(sanitizePreviewHtml(html)); }, [html]);

  const runConvert = useCallback(async () => {
    if (!sanitizedHtml.trim()) {
      setError("Enter HTML with visible content first.");
      return;
    }
    setProcessing(true);
    setError(null);
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const container = previewRef.current;
      if (!container) throw new Error("The HTML preview is unavailable.");

      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      if (!canvas.width || !canvas.height) throw new Error("The HTML preview produced an empty canvas.");

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const renderedHeight = canvas.height * (pdfWidth / canvas.width);
      let remainingHeight = renderedHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, renderedHeight);
      remainingHeight -= pdfHeight;
      while (remainingHeight > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, renderedHeight);
        remainingHeight -= pdfHeight;
      }

      pdf.save("document.pdf");
      trackExport("html-to-pdf", "HTML to PDF", sanitizedHtml.length);
      setSuccess(true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? `Failed to generate PDF: ${conversionError.message}` : "Failed to generate PDF.");
    } finally {
      setProcessing(false);
    }
  }, [sanitizedHtml, usage, upsell, trackExport]);

  const convert = useCallback(async () => {
    if (!sanitizedHtml.trim()) return;
    if (!isPremium()) {
      const remaining = await usage.peekUsage();
      if (remaining <= 0) { upsell.showUpsell("daily-limit"); return; }
      setShowTimer(true);
      return;
    }
    void runConvert();
  }, [sanitizedHtml, usage, upsell, runConvert]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="HTML to PDF - Free Online Converter"
        description="Convert HTML to PDF online for free. Turn HTML markup into professional PDF documents instantly."
        url="https://allaboutpdfediting.xyz/html-to-pdf"
      />
      <HowToJsonLd name="Convert HTML Markup to PDF" description="Render pasted HTML markup into an image-based PDF" steps={[{name:"Paste HTML markup",text:"Enter raw HTML; this tool does not fetch web-page URLs"},{name:"Review sanitized preview",text:"Preview the markup after scripts, embedded frames, and event handlers are removed"},{name:"Download PDF",text:"Render the preview into an A4 image-based PDF"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "HTML to PDF", item: "https://allaboutpdfediting.xyz/html-to-pdf" }]} />
      <FaqPageJsonLd questions={rc?.faqs} />
      <AiSummaryJsonLd name="HTML Markup to PDF" summary="Sanitize and raster-render pasted HTML markup into an A4 PDF" category="Utilities" inputType="Raw HTML markup" outputType="Image-based PDF" processing="client-side" price="free" features={["Sanitized HTML preview","Multi-page A4 output","Inline CSS rendering","Client-side conversion"]} limits="Does not fetch page URLs; remote assets referenced by markup may make network requests or fail CORS" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">HTML to PDF</h1>
        <p className="text-[var(--muted)]">Convert HTML markup to a downloadable PDF document.</p>
      </div>

      <ToolInfo
        name="HTML to PDF"
        description="Pasted markup is sanitized and rasterized locally with html2canvas and jsPDF. The tool does not accept URLs. Remote images, fonts, or CSS referenced inside your markup can still contact their hosts and may fail because of CORS."
      />

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
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </div>

        <ProgressBar processing={processing} label="Generating PDF..." />

        {showTimer && <FreeWaitTimer onDone={() => { setShowTimer(false); runConvert(); }} />}

        <button
          onClick={convert}
          disabled={!sanitizedHtml.trim() || processing || showTimer}
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

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About HTML to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Paste raw HTML markup, review its sanitized preview, and render that preview into an A4 PDF. Scripts, embedded frames, plugins, document metadata, linked stylesheets, and inline event handlers are removed before rendering. The result is rasterized, so its text is not selectable. This tool does not retrieve URLs or reproduce a live website; remote assets explicitly referenced by your markup may still make browser requests and are subject to CORS.</p>
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
