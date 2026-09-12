"use client";

import PiiGuardian from "@/components/PiiGuardian";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import ToolInfo from "@/components/ToolInfo";

const piiFaqs = [
  {
    question: "How does the in-browser PII Guardian work?",
    answer: "Our client-side engine scans your document using WebAssembly and PDF text streams directly in your browser. It looks for Social Security Numbers (SSNs), credit cards, IBANs, phone numbers, and emails using advanced regex pattern analysis. Zero files or text strings are ever sent over the network.",
  },
  {
    question: "Is this redaction permanent or just visual?",
    answer: "It is 100% permanent. Blackout rectangles are burned directly into the PDF object stream, preventing text selection, clipboard copying, and inspection in Adobe Acrobat or browser viewers.",
  },
  {
    question: "Can I use this for HIPAA, GDPR, and legal compliance?",
    answer: "Yes. Because 100% of the scanning and stream modification happens inside your local device RAM, no protected health information (PHI) or personal data ever touches external cloud servers.",
  },
];

export default function PiiGuardianPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="PII Guardian - 1-Click PDF Privacy & Auto-Redaction Tool"
        description="Automatically scan and blackout Social Security Numbers, credit cards, emails, and phone numbers in PDF files with 100% client-side privacy."
        url="https://allaboutpdfediting.xyz/pii-guardian"
      />
      <HowToJsonLd
        name="Auto-Redact Sensitive PII from PDF"
        description="Detect and blackout confidential PII data in 3 clicks"
        steps={[
          { name: "Upload PDF", text: "Select or drag your PDF into the zero-knowledge scanner" },
          { name: "1-Click Scan", text: "Click Scan for PII to automatically detect SSNs, cards, and emails" },
          { name: "Blackout & Download", text: "Review detected sensitive items and burn permanent blackout rectangles" },
        ]}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PII Guardian", item: "https://allaboutpdfediting.xyz/pii-guardian" },
        ]}
      />
      <FaqPageJsonLd questions={piiFaqs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          <span>🛡️</span> Zero-Server Local Privacy Shield
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
          PII Guardian — 1-Click Auto-Redact
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl">
          Instantly scan and sanitize Social Security Numbers, credit cards, bank accounts, emails, and phone numbers before sharing. 100% offline-capable in your browser.
        </p>
      </div>

      <ToolInfo
        name="PII Guardian"
        description="Air-gapped privacy engine: Your sensitive legal documents, medical charts, and financial statements are scanned entirely inside your browser. No files or text are ever uploaded to cloud servers."
      />

      <div className="my-8">
        <PiiGuardian />
      </div>

      {/* Feature comparisons against Adobe */}
      <div className="mt-16 pt-12 border-t border-[var(--card-border)] space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-2">
            Why PII Guardian Beats Adobe Acrobat &amp; Cloud Tools
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Traditional tools force you to manually draw blackout boxes on every page, or upload sensitive documents to remote servers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-2xl">⚡</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">1-Click Auto-Detection</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              No need to skim hundreds of pages manually. Our regex engine flags all sensitive patterns in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-2xl">🔒</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">True Zero-Knowledge</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Compliant with HIPAA, GDPR, and strict legal NDAs. Processing stays 100% on your local hardware.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-2xl">⬛</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">True Stream Blackout</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Blackouts cannot be removed by zooming or copying text. Text items are completely overwritten in the PDF binary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
