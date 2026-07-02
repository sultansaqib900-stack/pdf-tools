import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Free PDF Tools for Lawyers — Redact, Merge, Protect & Convert Legal PDFs | PDFTools",
  description: "10+ free PDF tools for legal professionals. Redact sensitive info, merge discovery documents, protect client files, Bates number exhibits, and more. 100% browser-based, zero uploads, client data stays local.",
  openGraph: {
    title: "Free PDF Tools for Lawyers — Secure Legal Document Processing",
    description: "Redact, merge, protect, and Bates-number PDFs. All processing is local — client data never leaves your computer.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-lawyers",
  },
};

const legalTools = [
  {
    category: "🔒 Security & Compliance",
    items: [
      { href: "/redact", label: "Redact PDF", desc: "Permanently remove PII, SSNs, case details", link: "/for/redact-pdf-lawyers" },
      { href: "/search-redact", label: "Search & Redact", desc: "Auto-find and redact specific terms across entire doc", link: "/for/redact-pdf-legal-professionals" },
      { href: "/protect", label: "Protect PDF", desc: "Password-protect confidential case files" },
      { href: "/unlock", label: "Unlock PDF", desc: "Remove passwords from received documents" },
      { href: "/metadata-sanitizer", label: "Clean Metadata", desc: "Strip hidden author, dates, edits before sharing" },
      { href: "/flatten-pdf", label: "Flatten PDF", desc: "Remove form fields and layers permanently" },
    ],
  },
  {
    category: "📂 Document Management",
    items: [
      { href: "/merge", label: "Merge Discovery", desc: "Combine exhibits and discovery into one PDF", link: "/for/merge-pdf-lawyers" },
      { href: "/split", label: "Split PDF", desc: "Separate briefs by section or exhibit", link: "/for/split-pdf-lawyers" },
      { href: "/bates-numbering", label: "Bates Numbering", desc: "Add sequential numbers to every page", link: "/for/bates-numbering-pdf-legal-professionals" },
      { href: "/organize", label: "Organize Pages", desc: "Reorder, rotate, and arrange legal documents" },
      { href: "/compress", label: "Compress PDF", desc: "Shrink large filings for e-filing portals", link: "/for/compress-pdf-lawyers" },
      { href: "/add-page-numbers", label: "Page Numbers", desc: "Add page numbers to briefs and motions" },
    ],
  },
  {
    category: "🔄 Format & Conversion",
    items: [
      { href: "/pdf-to-word", label: "PDF to Word", desc: "Edit text from contracts and agreements" },
      { href: "/word-to-pdf", label: "Word to PDF", desc: "Convert drafts to PDF for filing", link: "/for/word-to-pdf-lawyers" },
      { href: "/image-to-pdf", label: "Image to PDF", desc: "Turn photos of signed docs into PDF" },
      { href: "/scan-to-pdf", label: "Scan to PDF", desc: "Convert scanned documents to searchable PDF" },
      { href: "/ocr-pdf", label: "OCR PDF", desc: "Extract text from scanned case law" },
    ],
  },
];

export default function PDFToolsForLawyersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Tools for Lawyers", item: "https://allaboutpdfediting.xyz/pdf-tools-for-lawyers" },
        ]}
      />
      <FaqPageJsonLd
        questions={[
          { question: "Is this secure enough for client confidential information?", answer: "Absolutely. All processing happens locally in your browser. Files never reach our servers. Client data never leaves your computer. We cannot access, store, or see your documents." },
          { question: "Can I permanently redact text from a PDF?", answer: "Yes. Our Redact PDF tool permanently removes selected text and images. For advanced workflows, Search & Redact (premium) automatically finds and redacts specific terms across entire documents." },
          { question: "Do you support Bates numbering?", answer: "Yes, as a premium feature. Add sequential page numbers with custom prefix, suffix, padding, and positioning to every page in your document." },
          { question: "Can I merge multiple discovery documents?", answer: "Yes. Merge unlimited PDFs with drag-and-drop reordering. Free tier supports up to 5 files; premium supports unlimited." },
          { question: "How do I clean metadata before sharing?", answer: "Use our Metadata Sanitizer (premium). It strips author name, creation date, software, annotations, and embedded files — leaving a clean document for external sharing." },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-600 to-slate-800 text-white text-sm font-semibold mb-4">
            ⚖️ Trusted by Legal Professionals
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            PDF Tools for<br />
            <span className="text-slate-400">Lawyers & Legal Teams</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Redact sensitive information, merge discovery documents, Bates-number exhibits, and
            protect client files — all in your browser. Zero uploads, client data stays local.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--muted)]">
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Uploads to Server</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Client Data Stays Local</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Account Required</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Works on Any Device</span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { number: "17", label: "Legal-Ready Tools", desc: "Redact, Bates, merge, protect & more" },
            { number: "0", label: "Uploads", desc: "Everything runs in your browser" },
            { number: "100%", label: "Local Processing", desc: "Client data never reaches any server" },
            { number: "⚡", label: "Bulk Ready", desc: "Process hundreds of pages at once" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-center">
              <div className="text-2xl font-bold text-slate-400">{s.number}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{s.label}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </section>

        {/* Tools by Category */}
        {legalTools.map((cat) => (
          <section key={cat.category} className="mb-12">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">{cat.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-slate-400/30 hover:shadow-md transition group"
                >
                  <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-slate-400 transition-colors mb-1">{tool.label}</h3>
                  <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <AdBanner className="mb-12" />

        {/* Premium Spotlight */}
        <section className="mb-12 p-6 rounded-xl border-2 border-amber-400/30 bg-gradient-to-br from-amber-950/10 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🔢</span>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Bates Numbering</h2>
              <p className="text-xs text-amber-500 font-semibold">Premium Feature</p>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Add sequential Bates numbers to every page of your legal documents. Custom prefix,
            suffix, number padding, font, size, and position — all processed locally.
          </p>
          <Link href="/bates-numbering" className="inline-block px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition text-sm">
            Try Bates Numbering →
          </Link>
        </section>

        {/* By Practice Area */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">By Practice Area</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Litigation", desc: "Bates-number exhibits, merge discovery, redact privileged info, compress filings for e-filing", link: "/for/compress-pdf-lawyers" },
              { title: "Corporate / Transactional", desc: "Redact confidential terms, merge contracts, clean metadata before sharing", link: "/for/redact-pdf-legal-professionals" },
              { title: "Immigration", desc: "Compress green card applications, merge supporting docs, protect client records", link: "/for/merge-pdf-lawyers" },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="font-bold text-[var(--foreground)] mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] mb-3">{item.desc}</p>
                <Link href={item.link} className="text-xs text-slate-400 font-medium hover:underline">See all {item.title.toLowerCase()} tools →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Promise */}
        <section className="mb-12 p-6 rounded-xl border-2 border-amber-500/20 bg-amber-950/5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">🔒 Privacy Guarantee for Legal Professionals</h2>
          <div className="text-sm text-[var(--muted)] space-y-2">
            <p>Unlike cloud-based PDF tools, <strong>we never receive your files</strong>. All processing uses WebAssembly in your browser:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No upload to any server — files stay on your device</li>
              <li>No cookies or tracking on tool pages</li>
              <li>No account creation required</li>
              <li>Fully functional offline after the initial page load</li>
            </ul>
            <p className="mt-3">This means client confidential information never leaves your computer. Compliant with ethical obligations to protect client data.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Common Questions</h2>
          <div className="space-y-2">
            {[
              { q: "Is this compliant with legal ethics rules on client confidentiality?", a: "Yes. Because all processing happens locally, no client data is transmitted. This aligns with ethical obligations to protect client confidences." },
              { q: "Can I use this on a firm-issued laptop?", a: "Yes. Nothing to install — works in Chrome, Firefox, Edge, and Safari. No IT approval needed." },
              { q: "Do you save or store any documents?", a: "No. Files are never uploaded. We have zero access to your documents." },
              { q: "Can I redact multiple documents at once?", a: "The free Redact tool works on one file at a time. Premium Search & Redact can process multiple documents and auto-redact specified terms." },
              { q: "What is the maximum file size?", a: "Free tier supports up to 10MB. Premium supports up to 100MB for large discovery productions." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm">
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-slate-400 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Client-Side Security, Enterprise-Grade Tools</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">All free. No uploads. No signup. Your client data never leaves your computer.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg">
            Browse All Legal PDF Tools →
          </Link>
        </section>
      </div>
    </>
  );
}
