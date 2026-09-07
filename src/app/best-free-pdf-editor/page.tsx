import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Free PDF Editor 2026 — Top 10 Tools Compared",
  description: "Compare the best free PDF editors online in 2026. Free alternatives to Adobe Acrobat, SmallPDF, and iLovePDF. No uploads, no signup, all browser-based.",
  openGraph: {
    title: "Best Free PDF Editor Online 2026 — Top 10 Compared",
    description: "Free alternatives to Adobe Acrobat. No uploads, no signup, all browser-based.",
  },
};

const comparisons = [
  { name: "PDFTools", url: "/compress", free: true, uploads: false, limit: "10MB", batch: false, signup: false, ads: true, rating: 5 },
  { name: "SmallPDF", url: "https://smallpdf.com", free: false, uploads: true, limit: "2/day", batch: false, signup: true, ads: false, rating: 4 },
  { name: "iLovePDF", url: "https://ilovepdf.com", free: true, uploads: true, limit: "10MB", batch: true, signup: true, ads: true, rating: 4 },
  { name: "PDF Candy", url: "https://pdfcandy.com", free: true, uploads: true, limit: "10MB", batch: false, signup: false, ads: true, rating: 3 },
  { name: "Sejda PDF", url: "https://sejda.com", free: true, uploads: true, limit: "3/day", batch: false, signup: false, ads: true, rating: 4 },
  { name: "Adobe Acrobat Online", url: "https://acrobat.adobe.com", free: false, uploads: true, limit: "1/day", batch: false, signup: true, ads: false, rating: 3 },
];

export default function ComparisonPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <a href="/blog" className="text-sm text-[var(--accent)] hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">Best Free PDF Editor Online 2026</h1>
      <p className="text-[var(--muted)] mb-8">A complete comparison of the best free PDF editors available online. All tools work in your browser — no downloads needed.</p>

      <div className="overflow-x-auto mb-10">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">Tool</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">Free</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">No Uploads</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">File Limit</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">No Signup</th>
              <th className="text-left py-3 px-4 font-semibold text-[var(--foreground)]">Rating</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.name} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="py-3 px-4 font-medium">
                  {c.url.startsWith("http") ? (
                    <a href={c.url} target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">{c.name}</a>
                  ) : (
                    <Link href={c.url} className="text-[var(--accent)] hover:underline font-bold">{c.name}</Link>
                  )}
                </td>
                <td className="py-3 px-4">{c.free ? <Icon name="check" size={15} className="text-[var(--success)]" aria-label="Yes" /> : <span className="text-[var(--muted)]">Paid</span>}</td>
                <td className="py-3 px-4">{!c.uploads ? <Icon name="check" size={15} className="text-[var(--success)]" aria-label="Yes" /> : <span className="text-[var(--muted)]">Server</span>}</td>
                <td className="py-3 px-4">{c.limit}</td>
                <td className="py-3 px-4">{c.signup ? <Icon name="close" size={15} className="text-[var(--muted)]" aria-label="No" /> : <Icon name="check" size={15} className="text-[var(--success)]" aria-label="Yes" />}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-0.5" aria-label={`${c.rating} out of 5`}>
                    {Array.from({ length: c.rating }).map((_, i) => (
                      <Icon key={i} name="star" size={13} className="text-[var(--premium)]" />
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-[var(--r-lg)] p-6 mb-10">
        <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] mb-2">
          <Icon name="award" size={20} className="text-[var(--premium)]" />
          Winner: PDFTools
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">PDFTools is the only tool that combines completely free usage, zero server uploads, no signup requirement, and generous 10MB file limits. All 24+ tools work entirely in your browser using WebAssembly. Your files never leave your device.</p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] text-sm hover:bg-[var(--accent-hover)] transition">Try PDFTools Free →</Link>
      </div>

      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why PDFTools Stands Out</h2>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">No Uploads = Complete Privacy</h3>
          <p className="text-sm text-[var(--muted)]">Most PDF editors require uploading your files to their servers. PDFTools processes everything in your browser. Your sensitive documents never leave your computer. This is a fundamental privacy advantage.</p>
        </div>
        <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">100% Free (No Tricks)</h3>
          <p className="text-sm text-[var(--muted)]">No free trial, no credit card, no "2 free files per day" limit. All basic tools are completely free with a 10MB file limit. Premium removes limits and ads for users who want more.</p>
        </div>
        <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">24+ Tools, One Site</h3>
          <p className="text-sm text-[var(--muted)]">Compress, merge, split, convert, edit, sign, protect, unlock, and now chat with PDFs using AI. Everything on one site — no jumping between different tools.</p>
        </div>
        <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">Works Offline-Ready</h3>
          <p className="text-sm text-[var(--muted)]">Once loaded, the PDF processing libraries run entirely in your browser. No ongoing server connection needed. This means faster processing and true offline capability for installed users.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">What About Paid Tools?</h2>
      <p className="text-sm text-[var(--muted)] mb-8">Adobe Acrobat Pro costs ~$25/month. SmallPDF Premium is ~$12/month. iLovePDF Premium is ~$7/month. If you need basic PDF editing (compress, merge, split, rotate, convert), free tools like PDFTools handle 90% of use cases with zero cost. Only consider paid if you need advanced features like OCR, PDF/A conversion, or very large file support.</p>

      <div className="border border-[var(--border)] rounded-[var(--r-lg)] p-6">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Try the Best Free PDF Editor</h2>
        <p className="text-sm text-[var(--muted)] mb-4">No uploads, no signup, 100% private. Start editing your PDFs instantly.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/compress" className="px-4 py-2 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] text-sm hover:bg-[var(--accent-hover)] transition">Compress PDF</Link>
          <Link href="/merge" className="px-4 py-2 bg-[var(--success)] text-white font-medium rounded-[var(--r-lg)] text-sm hover:opacity-90 transition">Merge PDF</Link>
          <Link href="/split" className="px-4 py-2 bg-[var(--accent)] text-white font-medium rounded-[var(--r-lg)] text-sm hover:bg-[var(--accent)] transition">Split PDF</Link>
          <Link href="/image-to-pdf" className="px-4 py-2 bg-[var(--premium)] text-white font-medium rounded-[var(--r-lg)] text-sm hover:opacity-90 transition">Image to PDF</Link>
        </div>
      </div>
    </div>
  );
}
