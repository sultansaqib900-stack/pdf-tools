import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Free PDF Tools for College Students — Compress, Merge, Edit & More | PDFTools",
  description: "12 free PDF tools every student needs. Compress lecture slides for email, merge research papers, convert assignments to PDF, extract text from scanned textbooks, and more. Zero signup, 100% browser-based.",
  openGraph: {
    title: "Free PDF Tools for College Students — Save Time on Document Busywork",
    description: "Compress, merge, split, and edit PDFs for free. No uploads, no signup, no student email required. Everything runs in your browser.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-students",
  },
};

const studentTools = [
  {
    category: "📚 Study & Reading",
    items: [
      { href: "/compress", label: "Compress Lecture Slides", desc: "Shrink 20MB slides to under 5MB for email", link: "/for/compress-pdf-college-students" },
      { href: "/merge", label: "Merge Research Papers", desc: "Combine readings into one document", link: "/for/merge-pdf-college-students" },
      { href: "/split", label: "Split Textbook Chapters", desc: "Extract chapters from digital textbooks", link: "/for/split-pdf-college-students" },
      { href: "/chat-pdf", label: "Chat with PDF (AI)", desc: "AI summarize long readings in seconds" },
    ],
  },
  {
    category: "✍️ Assignments & Submissions",
    items: [
      { href: "/word-to-pdf", label: "Word to PDF", desc: "Convert essays to PDF for submission" },
      { href: "/image-to-pdf", label: "Image to PDF", desc: "Turn phone photos of notes into PDF" },
      { href: "/edit-pdf", label: "Edit PDF", desc: "Add text, highlight key passages" },
      { href: "/sign", label: "Sign PDF Forms", desc: "Sign permission slips & agreements" },
    ],
  },
  {
    category: "🔧 Format & Fix",
    items: [
      { href: "/ocr-pdf", label: "OCR Scanned Notes", desc: "Extract text from scanned textbooks" },
      { href: "/pdf-to-word", label: "PDF to Word", desc: "Edit PDF text in Microsoft Word" },
      { href: "/protect", label: "Protect PDF", desc: "Password-protect your assignments" },
      { href: "/organize", label: "Organize Pages", desc: "Reorder, rotate, delete PDF pages" },
    ],
  },
];

export default function PDFToolsForStudentsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "https://allaboutpdfediting.xyz" },
          { name: "PDF Tools for Students", item: "https://allaboutpdfediting.xyz/pdf-tools-for-students" },
        ]}
      />
      <FaqPageJsonLd
        questions={[
          { question: "Are these PDF tools really free for students?", answer: "Yes, completely free. No student email required, no trial period, no credit card. All basic tools are free to use daily, and premium is available for unlimited access." },
          { question: "Do I need to upload my files to a server?", answer: "No. All processing happens locally in your browser. Your files never leave your device, keeping your assignments and personal information private." },
          { question: "Can I use these tools on my phone?", answer: "Yes. All tools work in any modern browser on phone, tablet, or laptop. No app download needed." },
          { question: "What is the maximum file size for free?", answer: "Free tier supports files up to 10MB, which covers most student documents. Premium supports up to 100MB." },
          { question: "How do I compress a PDF for email submission?", answer: "Use our Compress PDF tool. Upload your file, choose compression level, and download. Most PDFs shrink 40-80% with no visible quality loss." },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold mb-4">
            🎓 100% Free for Students
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            Free PDF Tools for<br />
            <span className="text-indigo-500">College Students</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            The only PDF tools you need through college. Compress lecture slides, merge research papers,
            convert handwritten notes to PDF, and AI-summarize textbook chapters — all in your browser, all free.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--muted)]">
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Signup</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Uploads</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ No Student Email Needed</span>
            <span className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--card-border)]">✓ Works on Phone</span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { number: "12", label: "Free Tools", desc: "Compress, merge, split, OCR, AI chat & more" },
            { number: "40-80%", label: "Compression", desc: "Reduce PDF size without quality loss" },
            { number: "0", label: "Uploads", desc: "Everything runs in your browser" },
            { number: "451", label: "Pages Indexed", desc: "150+ tools & guides, 300+ use-case pages" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-center">
              <div className="text-2xl font-bold text-indigo-500">{s.number}</div>
              <div className="text-sm font-semibold text-[var(--foreground)]">{s.label}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </section>

        {/* Tools by Category */}
        {studentTools.map((cat) => (
          <section key={cat.category} className="mb-12">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">{cat.category}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cat.items.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-400/30 hover:shadow-md transition group"
                >
                  <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-indigo-500 transition-colors mb-1">{tool.label}</h3>
                  <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <AdBanner className="mb-12" />

        {/* Student Use-Case Spotlight */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">By Student Type</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "High School", desc: "Compress project files, merge slides, convert images to PDF", link: "/for/compress-pdf-high-school-students" },
              { title: "College / University", desc: "Split textbook chapters, OCR lecture notes, AI chat with readings", link: "/for/merge-pdf-college-students" },
              { title: "International Students", desc: "Compress visa docs, merge application PDFs, protect transcripts", link: "/for/compress-pdf-students-abroad" },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="font-bold text-[var(--foreground)] mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] mb-3">{item.desc}</p>
                <Link href={item.link} className="text-xs text-indigo-500 font-medium hover:underline">See all {item.title.toLowerCase()} tools →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Students Choose PDFTools */}
        <section className="mb-12 p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Why Students Use PDFTools</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: "🔒", title: "Privacy First", desc: "Your essays and assignments never leave your computer. All processing is local." },
              { emoji: "⚡", title: "No Waiting", desc: "No upload queues, no server delays. Results in seconds." },
              { emoji: "📱", title: "Works on Any Device", desc: "Phone, tablet, laptop — all tools work in your browser." },
              { emoji: "🆓", title: "Actually Free", desc: "No trial, no student email, no credit card. Just free PDF tools." },
              { emoji: "🌐", title: "No Install", desc: "Nothing to download. Open your browser and go." },
              { emoji: "🎯", title: "Built for Students", desc: "Every tool solves a real student problem, from semester 1 to graduation." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{item.title}</h3>
                  <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Common Questions</h2>
          <div className="space-y-2">
            {[
              { q: "Can I use these tools on my phone?", a: "Yes. All tools work on any device with a modern browser — phone, tablet, or laptop." },
              { q: "Do I need a .edu email?", a: "No. No account or email of any kind is required. Just upload and go." },
              { q: "Is there a daily limit?", a: "Free tier allows 5 uses per day per tool. Premium removes all limits." },
              { q: "What if my file is too large?", a: "Free tier handles up to 10MB. For larger files, use our Compress tool first, or upgrade to Premium (up to 100MB)." },
              { q: "Can I edit text in a PDF?", a: "You can add new text, highlights, and shapes. For deep text edits, convert to Word first." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm">
                <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer text-sm font-medium text-[var(--foreground)] hover:text-indigo-600 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Stop Paying for PDF Tools</h2>
          <p className="text-indigo-200 mb-6 max-w-lg mx-auto">Everything you need for free, forever. No subscriptions, no hidden charges.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg">
            Browse All PDF Tools →
          </Link>
        </section>
      </div>
    </>
  );
}
