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
    answer: "PDF.js extracts selectable text locally in your browser, and deterministic regular expressions look for common SSN, card-number, IBAN, phone, email, currency, and IPv4 formats. Pattern matching can produce false positives or miss unusual formats, so every match must be reviewed before redaction.",
  },
  {
    question: "Is this redaction permanent or just visual?",
    answer: "Selected matches are removed by rendering each page, applying opaque black boxes, and creating a new image-based PDF. The original text and content streams are not copied into that output, but you should still inspect the downloaded file before sharing it.",
  },
  {
    question: "Does this tool guarantee HIPAA, GDPR, or legal compliance?",
    answer: "No. Local processing reduces disclosure risk, but a browser tool and regex detector cannot certify a workflow or guarantee that every sensitive item was found. Compliance depends on your organization, procedures, review, and applicable law.",
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
          PII Guardian — Pattern Scan & Secure Redaction
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl">
          Scan selectable PDF text for common sensitive-data patterns, review the matches, and securely raster-redact the selected areas in your browser.
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
            How PII Guardian Works
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
              Processing stays in the browser, but results still require human review and this tool does not certify legal or regulatory compliance.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] space-y-3">
            <span className="text-2xl">⬛</span>
            <h3 className="text-base font-bold text-[var(--foreground)]">True Stream Blackout</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Selected areas are blacked out before pages are rebuilt from pixels, so original text and content streams are excluded from the downloaded PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
