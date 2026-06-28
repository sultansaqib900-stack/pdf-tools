import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "PDF Tools for Business — Secure Document Management | PDFTools",
  description: "Free PDF tools for businesses. Compress, merge, protect, and edit business documents securely — no server uploads, no signup required.",
  openGraph: {
    title: "PDF Tools for Business",
    description: "Secure business document tools. No server uploads, no signup.",
  },
};

export default function PDFToolsForBusinessPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Tools for Business", item: "https://allaboutpdfediting.xyz/pdf-tools-for-business" }]} />
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

      <AdBanner className="mb-8" />

      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Business-Ready PDF Tools</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Free for individuals, with premium plans for teams that need unlimited usage and extra features.</p>
        <Link href="/tools" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">View All Business Tools →</Link>
      </div>
    </div>
  );
}
