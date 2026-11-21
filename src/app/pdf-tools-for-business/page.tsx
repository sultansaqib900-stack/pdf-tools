import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-tools-for-business",
  title: "PDF Tools for Business — Secure Document Management",
  description: "Free PDF tools for businesses. Compress, merge, protect, and edit business documents securely — no server uploads, no signup required.",
});
export default function PDFToolsForBusinessPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Tools", item: "https://allaboutpdfediting.xyz/tools" }, { name: "PDF Tools for Business", item: "https://allaboutpdfediting.xyz/pdf-tools-for-business" }]} />
      <FaqPageJsonLd
        questions={[
          { question: "How do I keep a board pack under the email attachment limit?", answer: "Merge the reports into one PDF, then compress that merged file. Corporate mail gateways typically cap attachments well below what a local file can be, so check the downloaded size against your IT limit." },
          { question: "Is it safe to process confidential reports in a browser?", answer: "Core tools process the file locally, so the document is not uploaded. The exception is opting into an AI feature, which sends extracted text or rendered page images to the AI service." },
          { question: "Can we track what changed between two contract versions?", answer: "Yes. PDF Diff renders both versions and reports extracted-text additions and deletions so a reviewer can see what actually moved between revisions." },
          { question: "Do we need a subscription to protect client contracts?", answer: "No. Password Protect is a core tool and encrypts without an account. Premium adds larger file limits, batch processing, and the professional workflow suite." },
          { question: "Can I strip metadata before sending a document externally?", answer: "The free Metadata Editor clears title, author, subject, and keywords. Metadata Sanitizer additionally removes annotations, embedded files, and scripting, and is a professional tool." },
        ]}
      />
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">PDF Tools for Business</h1>
      <p className="text-[var(--muted)] mb-8">Professional PDF tools for businesses of all sizes. Compress, merge, sign, protect, and edit documents — all client-side with zero server uploads. Your confidential business documents never leave your computer.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/compress", label: "Compress PDF", desc: "Shrink files for email & storage" },
          { href: "/merge", label: "Merge PDFs", desc: "Combine contracts & reports" },
          { href: "/protect", label: "Protect PDF", desc: "Add password security" },
          { href: "/sign", label: "Sign PDF", desc: "e-Sign contracts digitally" },
          { href: "/watermark", label: "Watermark PDF", desc: "Brand your documents" },
          { href: "/redact", label: "Redact PDF", desc: "Remove sensitive data" },
          { href: "/batch", label: "Batch Process", desc: "Process multiple files at once" },
          { href: "/pdf-diff", label: "Compare PDFs", desc: "Track document changes" },
          { href: "/chat-pdf", label: "Chat with PDF", desc: "AI analyze documents" },
          { href: "/split", label: "Split PDF", desc: "Extract specific sections" },
          { href: "/image-to-pdf", label: "Image to PDF", desc: "Convert receipts & scans" },
          { href: "/bates-numbering", label: "Bates Numbering", desc: "Number legal documents" },
        ].map((tool) => (
          <Link key={tool.href} href={tool.href} className="border border-[var(--card-border)] rounded-xl p-4 hover:border-indigo-500 transition text-center">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">{tool.label}</h3>
            <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-6 mb-10">
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Protect Confidential Business Documents</h2>
          <p className="text-sm text-[var(--muted)]">Password-protect your PDFs before sharing them with clients, partners, or employees. Use <Link href="/protect" className="text-indigo-500 underline">Protect PDF</Link> to add encryption, and <Link href="/redact" className="text-indigo-500 underline">Redact PDF</Link> to permanently remove sensitive information from documents.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">e-Sign Contracts in Minutes</h2>
          <p className="text-sm text-[var(--muted)]">No need for DocuSign for simple contracts. Use <Link href="/sign" className="text-indigo-500 underline">Sign PDF</Link> to add your signature digitally — draw it, type it, or upload an image. Combine with <Link href="/merge" className="text-indigo-500 underline">Merge PDFs</Link> to build complete contract packages.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Brand Your Documents with Watermarks</h2>
          <p className="text-sm text-[var(--muted)]">Add &quot;Confidential&quot;, &quot;Draft&quot;, or your company logo as a watermark to every page. <Link href="/watermark" className="text-indigo-500 underline">Watermark PDF</Link> supports text and image watermarks with customizable position, opacity, and rotation. <Link href="/batch" className="text-indigo-500 underline">Batch Process</Link> to watermark multiple files at once.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Track Document Changes with PDF Comparison</h2>
          <p className="text-sm text-[var(--muted)]">Need to see what changed between contract versions? Use <Link href="/pdf-diff" className="text-indigo-500 underline">Compare PDFs</Link> to view side-by-side differences with highlighted changes. Essential for contract negotiations and document review.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Zero Uploads = Zero Data Risk</h2>
          <p className="text-sm text-[var(--muted)]">Unlike other tools that process documents on remote servers, PDFTools runs entirely in your browser. Your contracts, financial statements, and confidential business data never touch an external server. No data breaches, no third-party access, no compliance headaches.</p>
        </div>
      </div>


      <div className="space-y-6 mb-10">
        <h2 className="text-xl font-bold text-[var(--foreground)]">How a document workflow actually runs</h2>
        <p className="text-sm text-[var(--muted)]">Most business document problems are assembly problems, not editing problems:</p>
        <div className="grid gap-3">
          <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Board pack</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">Four team reports arrive in four layouts. Merge them in agenda order, then add page numbers so a discussion can reference &quot;pack page 14&quot;.</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Contract cycle</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">PDF Diff compares the returned redline against the version you sent, so negotiation changes are actually reviewed instead of skimmed.</p>
          </div>
          <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Client hand-off</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">Watermark drafts, password-protect signed finals, and strip metadata before anything goes to an external recipient.</p>
          </div>
        </div>
        <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 p-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            <strong className="text-[var(--foreground)]">Watch out:</strong> merge first and compress last — one compressed pack is smaller than several compressed sections merged afterwards.
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Common Questions</h2>
        <div className="space-y-2">
          {
            [
              { q: "How do I keep a board pack under the email attachment limit?", a: "Merge the reports into one PDF, then compress that merged file. Corporate mail gateways typically cap attachments well below what a local file can be, so check the downloaded size against your IT limit." },
              { q: "Is it safe to process confidential reports in a browser?", a: "Core tools process the file locally, so the document is not uploaded. The exception is opting into an AI feature, which sends extracted text or rendered page images to the AI service." },
              { q: "Can we track what changed between two contract versions?", a: "Yes. PDF Diff renders both versions and reports extracted-text additions and deletions so a reviewer can see what actually moved between revisions." },
              { q: "Do we need a subscription to protect client contracts?", a: "No. Password Protect is a core tool and encrypts without an account. Premium adds larger file limits, batch processing, and the professional workflow suite." },
              { q: "Can I strip metadata before sending a document externally?", a: "The free Metadata Editor clears title, author, subject, and keywords. Metadata Sanitizer additionally removes annotations, embedded files, and scripting, and is a professional tool." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm">
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-indigo-600 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</div>
              </details>
            ))
          }
        </div>
      </section>

      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Business-Ready PDF Tools</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Free for individuals, with premium plans for teams that need unlimited usage and extra features.</p>
        <Link href="/tools" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">View All Business Tools →</Link>
      </div>
    </div>
  );
}
