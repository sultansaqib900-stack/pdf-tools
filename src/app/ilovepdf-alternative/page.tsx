import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "iLovePDF Alternative — Free, Private PDF Editor Online | PDFTools",
  description: "Looking for an iLovePDF alternative? PDFTools is a free, private PDF editor with no server uploads, no signup, and no daily limits. Compress, merge, split, and edit PDFs entirely in your browser.",
  openGraph: {
    title: "iLovePDF Alternative — Free & Private",
    description: "Free alternative to iLovePDF. No uploads, no signup, no daily limits. All in your browser.",
  },
};

export default function ILovePDFAltPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "iLovePDF Alternative", item: "https://allaboutpdfediting.xyz/ilovepdf-alternative" }]} />
      <ArticleJsonLd title="iLovePDF Alternative — Free, Private PDF Editor Online" description="Looking for an iLovePDF alternative? PDFTools is a free, private PDF editor with no server uploads, no signup, and no daily limits." url="https://allaboutpdfediting.xyz/ilovepdf-alternative" datePublished="2026-06-27" />
      <a href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">iLovePDF Alternative — Free &amp; Private</h1>
      <p className="text-[var(--muted)] mb-8">iLovePDF is popular, but it uploads your files to their servers, shows distracting ads, and limits free users to one file per hour. Here&apos;s why PDFTools is the best free iLovePDF alternative.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 text-center">iLovePDF</h2>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Files uploaded to servers</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> 1 file/hour free limit</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Requires signup for batch</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Paid: $7/month</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Distracting ads</li>
            <li className="flex items-center gap-2"><span className="text-amber-500">~</span> 25+ tools</li>
          </ul>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Better Choice</div>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 text-center">PDFTools</h2>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No uploads — browser only</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 5 files/day free</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No signup required</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 100% free (Premium optional)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Minimal, clean interface</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 24+ tools + AI Chat</li>
          </ul>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why Switch from iLovePDF</h2>

      <div className="space-y-6 mb-10">
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">1. Privacy — No Server Uploads</h3>
          <p className="text-sm text-[var(--muted)]">iLovePDF processes files on their servers, meaning your documents are transmitted and stored externally. PDFTools runs entirely in your browser using WebAssembly and pdf-lib. Your files never leave your device. For confidential documents, contracts, or personal information, this is the safer choice. <Link href="/compress" className="text-indigo-500 underline">Test it yourself</Link> — your file stays on your computer.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">2. No Hourly Limits</h3>
          <p className="text-sm text-[var(--muted)]">iLovePDF restricts free users to 1 PDF per hour — a frustrating cap when you need to process multiple files. PDFTools gives you 5 uses per day free, with no arbitrary cooldown. <Link href="/premium" className="text-indigo-500 underline">Premium</Link> removes all limits.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">3. Clean, Ad-Light Experience</h3>
          <p className="text-sm text-[var(--muted)]">iLovePDF&apos;s free tier is cluttered with ads. PDFTools keeps a minimal interface with non-intrusive ad placements. Focus on your documents, not on pop-ups and banners.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">4. AI-Powered PDF Features</h3>
          <p className="text-sm text-[var(--muted)]">iLovePDF doesn&apos;t offer AI features. PDFTools lets you <Link href="/chat-pdf" className="text-indigo-500 underline">Chat with your PDF</Link> — ask questions, summarize content, extract key information from any document using AI.</p>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">iLovePDF vs PDFTools: Tool Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-4 font-semibold text-[var(--foreground)]">Feature</th>
                <th className="text-left py-2 pr-4 font-semibold text-[var(--foreground)]">iLovePDF</th>
                <th className="text-left py-2 font-semibold text-[var(--foreground)]">PDFTools</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Compress PDF", "✓", "✓"],
                ["Merge PDF", "✓ (paid)", "✓"],
                ["Split PDF", "✓ (paid)", "✓"],
                ["Image to PDF", "✓", "✓"],
                ["PDF to Images", "✓ (paid)", "✓"],
                ["e-Sign PDF", "✓ (paid)", "✓"],
                ["Unlock PDF", "✓ (paid)", "✓"],
                ["Edit PDF", "✗", "✓"],
                ["OCR PDF", "✗", "✓"],
                ["Scan to PDF", "✗", "✓"],
                ["Repair PDF", "✗", "✓"],
                ["Chat with PDF", "✗", "✓"],
                ["File size limit", "10MB free", "10MB free"],
                ["Free rate limit", "1 file/hour", "5 files/day"],
                ["Server upload", "Required", "None"],
                ["Price", "From $7/mo", "Free / $8/mo premium"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-[var(--card-border)]">
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">{row[0]}</td>
                  <td className={`py-2 pr-4 ${row[1] === "✓" ? "text-emerald-500" : row[1] === "✗" ? "text-red-500" : ""}`}>{row[1]}</td>
                  <td className={`py-2 ${row[2] === "✓" ? "text-emerald-500 font-bold" : row[2] === "✗" ? "text-red-500" : "text-[var(--muted)]"}`}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdBanner className="mb-8" />

      <div className="border border-[var(--card-border)] rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Ready to Switch?</h2>
        <p className="text-sm text-[var(--muted)] mb-4">Try the best free iLovePDF alternative. No uploads, no signup, 100% private.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">Try PDFTools Free →</Link>
      </div>
    </div>
  );
}
