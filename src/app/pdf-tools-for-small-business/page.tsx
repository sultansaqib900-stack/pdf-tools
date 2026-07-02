import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Free PDF Tools for Small Business — Invoices, Contracts, Forms & More | PDFTools",
  description: "10+ free PDF tools for small businesses. Merge invoices, convert contracts to PDF, compress files for email, fill forms, sign agreements, and protect business documents. No signup, 100% browser-based.",
  openGraph: {
    title: "Free PDF Tools for Small Business",
    description: "Merge invoices, convert contracts, compress files for email, fill forms, and sign agreements — all free, all in your browser.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-small-business",
  },
};

const bizTools = [
  {
    category: "📄 Documents & Contracts",
    items: [
      { href: "/word-to-pdf", label: "Word to PDF", desc: "Convert contracts and proposals to PDF", link: "/for/word-to-pdf-small-business-owners" },
      { href: "/merge", label: "Merge PDFs", desc: "Combine contracts, invoices, and receipts", link: "/for/merge-pdf-small-business-owners" },
      { href: "/split", label: "Split PDF", desc: "Extract individual pages from documents", link: "/for/split-pdf-small-business-owners" },
      { href: "/pdf-to-word", label: "PDF to Word", desc: "Edit text in received contracts" },
    ],
  },
  {
    category: "✍️ Signatures & Forms",
    items: [
      { href: "/sign", label: "Sign PDF", desc: "Add your signature to agreements" },
      { href: "/fill-form", label: "Fill PDF Forms", desc: "Complete interactive PDF forms" },
      { href: "/edit-pdf", label: "Edit PDF", desc: "Add text, checkmarks, and highlights" },
      { href: "/image-to-pdf", label: "Image to PDF", desc: "Convert photos of signed docs to PDF" },
    ],
  },
  {
    category: "🔐 Security & Sharing",
    items: [
      { href: "/protect", label: "Protect PDF", desc: "Password-protect business documents" },
      { href: "/compress", label: "Compress PDF", desc: "Shrink files for email attachments", link: "/for/compress-pdf-small-business-owners" },
      { href: "/redact", label: "Redact PDF", desc: "Remove sensitive business info before sharing" },
      { href: "/unlock", label: "Unlock PDF", desc: "Open password-protected received files" },
    ],
  },
  {
    category: "📊 Reports & Data",
    items: [
      { href: "/pdf-to-excel", label: "PDF to Excel", desc: "Extract tables from financial reports" },
      { href: "/html-to-pdf", label: "HTML to PDF", desc: "Save web analytics as PDF reports" },
      { href: "/ocr-pdf", label: "OCR PDF", desc: "Extract text from scanned business cards & docs" },
    ],
  },
];

export default function PDFToolsForSmallBizPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Tools for Small Business", item: "https://allaboutpdfediting.xyz/pdf-tools-for-small-business" },
        ]}
      />
      <FaqPageJsonLd
        questions={[
          { question: "Are these tools really free for my business?", answer: "Yes. All basic tools are completely free with no hidden charges. Premium is available for unlimited daily use and larger files." },
          { question: "Can I use these for commercial purposes?", answer: "Absolutely. Use them for invoices, contracts, proposals, reports — any business document." },
          { question: "Is it secure for confidential business documents?", answer: "Yes. All processing happens in your browser. Files never reach our servers. Your contracts and financial data stay on your computer." },
          { question: "Can I e-sign contracts without printing?", answer: "Yes. Use Sign PDF to add your signature electronically, or Fill Form to complete PDF forms — all in your browser." },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold mb-4">
            💼 Built for Small Business
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            Free PDF Tools for<br />
            <span className="text-blue-500">Small Business</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Create contracts, merge invoices, sign agreements, compress files for email, and
            protect sensitive business documents — all free, all in your browser.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--muted)]">
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Subscription</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Uploads</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Commercial Use OK</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Processes Locally</span>
          </div>
        </section>

        {/* Tools by Category */}
        {bizTools.map((cat) => (
          <section key={cat.category} className="mb-12">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">{cat.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.items.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-blue-400/30 hover:shadow-md transition group"
                >
                  <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-blue-500 transition-colors mb-1">{tool.label}</h3>
                  <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <AdBanner className="mb-12" />

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Common Questions</h2>
          <div className="space-y-2">
            {[
              { q: "Do I need to create a business account?", a: "No. No account or signup of any kind is required. Just use the tools." },
              { q: "Can I use this for client work?", a: "Yes. All tools are free for commercial use. Process client documents, create deliverables, anything your business needs." },
              { q: "How do I protect a contract before sending?", a: "Use Protect PDF to add a password. Recipients will need the password to open the file." },
              { q: "Can I combine multiple invoices into one PDF?", a: "Yes. Use Merge PDF to combine individual invoices into a single file for easy distribution or archiving." },
              { q: "Is there a watermark on free documents?", a: "No. Free and premium outputs are identical — no watermarks, no branding added to your files." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm">
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-blue-600 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Free Business PDF Tools, Forever</h2>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">No subscriptions, no hidden charges. Just professional PDF tools that work.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow-lg">
            Browse All Business Tools →
          </Link>
        </section>
      </div>
    </>
  );
}
