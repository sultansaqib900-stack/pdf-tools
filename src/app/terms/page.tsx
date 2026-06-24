export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">Terms of Service</h1>
      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">1. Acceptance of Terms</h2>
        <p>
          By using PDFTools (the &quot;Service&quot;), you agree to these Terms of Service. If you do not agree,
          do not use the Service. We may update these terms at any time; continued use after changes
          constitutes acceptance.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">2. Service Description</h2>
        <p>
          PDFTools provides free and premium online PDF tools including compression, merging, splitting,
          conversion, editing, signing, protection, AI-powered chat with PDF, and OCR functionality.
          All tools are provided &quot;as is&quot; without warranty of any kind.
        </p>
        <p>
          Core processing happens entirely in your browser. AI features (Chat with PDF, OCR) send
          extracted text or page images to Google&apos;s Gemini API for processing.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">3. Free Usage Limits</h2>
        <p>
          Free users are limited to 5 tool uses per day and 3 AI chat questions per day. These limits
          reset every 24 hours. Limits are enforced via a client-side identifier stored in your browser.
          Premium subscribers receive unlimited usage.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">4. Premium Subscriptions</h2>
        <p>
          Premium subscriptions are processed via Lemon Squeezy. Payments are non-refundable except
          where required by applicable law. Premium benefits include unlimited daily usage, no ads,
          larger file sizes (up to 100MB), batch processing, and unlimited AI chat questions.
        </p>
        <p>
          We reserve the right to modify premium pricing, features, or availability with reasonable
          notice. Cancellation can be done anytime through Lemon Squeezy; access continues until the
          end of the billing period.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">5. User Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>You are responsible for ensuring your use complies with applicable laws.</li>
          <li>You must not use the Service for illegal purposes or to process unlawful content.</li>
          <li>You must not attempt to circumvent usage limits or bypass premium restrictions.</li>
          <li>You must not abuse the AI chat features (e.g., automated scripts, excessive requests).</li>
        </ul>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">6. Limitation of Liability</h2>
        <p>
          PDFTools is provided &quot;as is&quot; without any warranty, express or implied. We are not liable
          for any damages arising from the use or inability to use the Service, including data loss
          or corruption of PDF files. You use all tools at your own risk.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">7. Intellectual Property</h2>
        <p>
          The PDFTools name, logo, and site design are our intellectual property. The PDF tools
          themselves use open-source libraries (pdf-lib, pdfjs-dist) under their respective licenses.
          Your documents remain your property.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">8. Modifications to Service</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the Service at any
          time without notice. We are not liable to you or any third party for any modifications
          or discontinuation.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">9. Contact</h2>
        <p>
          For questions about these terms, email <strong>saqibbostan83@gmail.com</strong>.
        </p>

        <p className="text-xs text-[var(--muted)] pt-4 border-t border-[var(--card-border)]">
          Last updated: June 2026
        </p>
      </div>
    </div>
  );
}
