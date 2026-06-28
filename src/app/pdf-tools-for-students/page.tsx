import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import AdBanner from "@/components/AdBanner";

export const metadata: Metadata = {
  title: "Free PDF Tools for Students — Edit, Merge, Compress PDFs Online | PDFTools",
  description: "Free PDF tools for students. Compress lecture notes, merge research papers, convert assignments to PDF, and more — all in your browser with zero uploads.",
  openGraph: {
    title: "Free PDF Tools for Students",
    description: "Compress, merge, convert, and edit PDFs for free. No signup, no uploads.",
  },
};

export default function PDFToolsForStudentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "PDF Tools for Students", item: "https://allaboutpdfediting.xyz/pdf-tools-for-students" }]} />
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">Free PDF Tools for Students</h1>
      <p className="text-[var(--muted)] mb-8">All the PDF tools you need as a student — compress lecture slides, merge research papers, convert assignments, and more. 100% free, no signup, everything runs in your browser.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { href: "/compress", label: "Compress PDF", emoji: "📦", desc: "Shrink PDFs for email submission" },
          { href: "/merge", label: "Merge PDFs", emoji: "📑", desc: "Combine lecture notes & readings" },
          { href: "/split", label: "Split PDF", emoji: "✂️", desc: "Extract specific chapters" },
          { href: "/image-to-pdf", label: "Image to PDF", emoji: "🖼️", desc: "Convert photos to PDF" },
          { href: "/pdf-to-word", label: "PDF to Word", emoji: "📝", desc: "Edit PDF text in Word" },
          { href: "/word-to-pdf", label: "Word to PDF", emoji: "📄", desc: "Submit assignments as PDF" },
          { href: "/sign", label: "Sign PDF", emoji: "✍️", desc: "Sign permission forms" },
          { href: "/chat-pdf", label: "Chat with PDF", emoji: "🤖", desc: "AI summarize your readings" },
          { href: "/ocr-pdf", label: "OCR PDF", emoji: "🔍", desc: "Extract text from scanned notes" },
        ].map((tool) => (
          <Link key={tool.href} href={tool.href} className="border border-[var(--card-border)] rounded-xl p-4 hover:border-indigo-500 transition text-center">
            <div className="text-2xl mb-2">{tool.emoji}</div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">{tool.label}</h3>
            <p className="text-xs text-[var(--muted)]">{tool.desc}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-6 mb-10">
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Compress Lecture Slides for Email</h2>
          <p className="text-sm text-[var(--muted)]">Professors often limit email attachments to 10MB or less. Our <Link href="/compress" className="text-indigo-500 underline">PDF Compressor</Link> shrinks your lecture slides by up to 70% — from 20MB to under 5MB — with no noticeable quality loss. Simply upload and download.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Merge Research Papers for Your Literature Review</h2>
          <p className="text-sm text-[var(--muted)]">Gathered multiple PDFs for your essay? Use <Link href="/merge" className="text-indigo-500 underline">Merge PDFs</Link> to combine them into one document. Drag and drop to reorder, then export as a single file for easy reference and citation.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Convert Assignments to PDF for Submission</h2>
          <p className="text-sm text-[var(--muted)]">Most universities accept only PDF for assignment submission. Use <Link href="/word-to-pdf" className="text-indigo-500 underline">Word to PDF</Link> to convert your essays, or <Link href="/image-to-pdf" className="text-indigo-500 underline">Image to PDF</Link> for handwritten work scanned with your phone.</p>
        </div>
        <div className="border border-[var(--card-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">AI Chat: Your Personal Study Assistant</h2>
          <p className="text-sm text-[var(--muted)]">Upload a textbook chapter or research paper to <Link href="/chat-pdf" className="text-indigo-500 underline">Chat with PDF</Link> and ask AI to summarize it, explain concepts, or extract key arguments. Perfect for exam prep and literature reviews.</p>
        </div>
      </div>

      <AdBanner className="mb-8" />

      <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-500 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Free for Students, Forever</h2>
        <p className="text-sm text-[var(--muted)] mb-4">No student email required. No trial period. No hidden limits. Just free PDF tools.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition">Browse All PDF Tools →</Link>
      </div>
    </div>
  );
}
