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

export default function HtmlToPdfPage() {
  const usage = useUsage();
  const upsell = usePremiumUpsell();
  const { trackToolVisit, trackExport } = useToolHistory();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const originalBytes = useRef<ArrayBuffer | null>(null);
  const [html, setHtml] = useState("<h1>Hello World</h1><p>Your content here.</p>");
  const [processing, setProcessing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
    const canProceed = await usage.checkAndTrack();
    if (!canProceed) { setProcessing(false); upsell.showUpsell("daily-limit"); return; }
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        trackExport("html-to-pdf", "HTML to PDF", html.length);
        setProcessing(false);
      }, 500);
    } catch {
      setError("Failed to generate PDF.");
      setProcessing(false);
    }
  }, [html, usage, upsell]);

  const runConvert = convert;

  const restoreOriginal = useCallback(async () => {
    if (!originalBytes.current) return;
    const blob = new Blob([originalBytes.current], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "original-document.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="HTML to PDF - Free Online Converter"
        description="Convert HTML to PDF online for free. Turn HTML markup into professional PDF documents instantly."
        url="https://allaboutpdfediting.xyz/html-to-pdf"
      />
      <HowToJsonLd name="Convert HTML to PDF" description="Convert HTML markup and web pages to PDF documents" steps={[{name:"Enter HTML",text:"Paste HTML code or enter a URL"},{name:"Preview",text:"Preview how the PDF will look"},{name:"Download PDF",text:"Download the HTML content as a PDF document"}]} />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "HTML to PDF", item: "https://allaboutpdfediting.xyz/html-to-pdf" }]} />
      <FaqPageJsonLd />
      <AiSummaryJsonLd name="HTML to PDF" summary="Convert HTML markup and web page URLs into PDF documents" category="Utilities" inputType="HTML" outputType="PDF" processing="client-side" price="free" features={["HTML conversion","URL to PDF","Preview","Free tool","Client-side processing"]} limits="Files up to 10MB" />
      <iframe ref={iframeRef} className="hidden" title="preview" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">HTML to PDF</h1>
        <p className="text-[var(--muted)]">Convert HTML markup to a printable PDF document.</p>
      </div>

      <ToolInfo
        name="HTML to PDF"
        description="Your content stays private. Conversion happens in your browser using the built-in print engine — no uploads, no servers. Paste HTML, preview, and save as PDF via your browser&apos;s print dialog."
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
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono outline-none focus:border-indigo-500 transition resize-y"
        />

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
              Opening print dialog...
            </span>
          ) : "Generate PDF"}
        </button>

        {!isPremium() && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Free users see a 5s wait.{ " " }
            <a href="/premium" className="text-indigo-500 font-medium hover:underline">Upgrade for instant processing</a>
          </p>
        )}

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <SuccessAnimation show={success} message="PDF generated!" />

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">How to use:</p>
          <ol className="text-xs text-amber-600 dark:text-amber-500 space-y-1 list-decimal list-inside">
            <li>Paste your HTML code in the editor above</li>
            <li>Click &quot;Generate PDF&quot;</li>
            <li>In the print dialog, choose &quot;Save as PDF&quot; as the destination</li>
            <li>Click Save to download your PDF</li>
          </ol>
        </div>
      </div>

      <AdBanner className="mt-8" />
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-[var(--card-border)]">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">About HTML to PDF</h2>
        <div className="text-sm text-[var(--muted)] space-y-3 leading-relaxed">
          <p>Convert your HTML markup to a polished PDF document with our free tool, ideal for developers, content creators, and documentation authors. Whether you need to save a web page for offline reading, create printable documentation from HTML templates, or generate reports dynamically, our HTML to PDF converter makes it straightforward. To convert HTML to PDF online free, paste your HTML code into the editor and click generate — the conversion uses your browser's built-in print engine, so everything stays client-side with no data uploaded to any server. Just paste your markup, preview the result, and save via your browser's print dialog. This tool is perfect for turning web content into portable, professionally formatted PDF documents.</p>
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
