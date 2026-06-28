import Link from "next/link";
import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "SmallPDF Alternative — Free & Private PDF Editor Online | PDFTools",
  description: "Looking for a SmallPDF alternative? PDFTools is a free, private PDF editor with no uploads, no signup, and no daily limits. Compress, merge, split, and edit PDFs in your browser.",
  openGraph: {
    title: "SmallPDF Alternative — Free & Private",
    description: "Free alternative to SmallPDF. No uploads, no signup, no daily limits. All in your browser.",
  },
};

export default function SmallPDFAltPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <a href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">SmallPDF Alternative — Free &amp; Private</h1>
      <p className="text-[var(--muted)] mb-8">SmallPDF is great, but it has limits: uploads to servers, daily file caps, and a paid subscription for full access. Here&apos;s why PDFTools is the best free SmallPDF alternative.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 text-center">SmallPDF</h2>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Files uploaded to servers</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> 2 files/day free limit</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Requires signup for more</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Paid: $12/month</li>
            <li className="flex items-center gap-2"><span className="text-red-500">✗</span> Limited free tools</li>
            <li className="flex items-center gap-2"><span className="text-amber-500">~</span> 29 tools</li>
          </ul>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Better Choice</div>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 text-center">PDFTools</h2>
          <ul className="space-y-3 text-sm text-[var(--muted)]">
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No uploads — browser only</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No daily limits (free)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> No signup required</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 100% free (Premium optional)</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 24+ tools + AI Chat</li>
            <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Works offline-ready</li>
          </ul>
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why People Are Switching from SmallPDF</h2>

      <div className="space-y-6 mb-10">
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">1. Privacy — Your Files Stay on Your Device</h3>
          <p className="text-sm text-[var(--muted)]">SmallPDF uploads your files to their servers for processing. With PDFTools, everything runs in your browser using WebAssembly and pdf-lib. No server ever sees your document. For sensitive contracts, financial statements, or personal documents, this is a critical difference. <Link href="/compress" className="text-indigo-500 underline">Try it yourself</Link> — your file never leaves your computer.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">2. No Daily Limits</h3>
          <p className="text-sm text-[var(--muted)]">SmallPDF restricts free users to 2 files per day. PDFTools gives you 5 uses per day free, with no artificial caps on which tools you can use. <Link href="/premium" className="text-indigo-500 underline">Premium</Link> removes all limits entirely.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">3. No Signup Wall</h3>
          <p className="text-sm text-[var(--muted)]">SmallPDF requires creating an account to use more than 2 files. PDFTools works instantly — no email, no password, no account needed. Just upload and process.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h3 className="font-semibold mb-2 text-[var(--foreground)]">4. AI Chat with PDF</h3>
          <p className="text-sm text-[var(--muted)]">A feature SmallPDF doesn&apos;t offer: upload any PDF and ask AI questions about its content. <Link href="/chat-pdf" className="text-indigo-500 underline">Chat with your PDF</Link> — extract key information, summarize chapters, find specific data without reading the entire document.</p>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">SmallPDF vs PDFTools: Tool Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-4 font-semibold text-[var(--foreground)]">Feature</th>
                <th className="text-left py-2 pr-4 font-semibold text-[var(--foreground)]">SmallPDF</th>
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
                ["Chat with PDF", "✗", "✓"],
                ["File size limit", "10MB free", "10MB free"],
                ["Daily limit", "2 files", "5 files"],
                ["Server upload", "Required", "None"],
                ["Price", "From $12/mo", "Free / $8/mo premium"],
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
        <p className="text-sm text-[var(--muted)] mb-4">Try the best free SmallPDF alternative. No uploads, no signup, 100% private.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">Try PDFTools Free →</Link>
      </div>
    </div>
  );
}
