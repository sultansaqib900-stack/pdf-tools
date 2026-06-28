"use client";
import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export default function HowToMergePDF() {
  return (
    <>
      <ArticleJsonLd title="How to Merge PDFs Online Free — Combine Multiple PDFs Into One" description="Learn how to merge PDF files online free. Combine multiple PDFs into one document in seconds. No signup, no uploads to servers." url="https://allaboutpdfediting.xyz/blog/how-to-merge-pdf" datePublished="2026-06-27" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Merge PDFs", item: "https://allaboutpdfediting.xyz/blog/how-to-merge-pdf" }]} />
      <HowToJsonLd name="How to Merge PDFs" description="Learn how to merge PDF files online free. Combine multiple PDFs into one document in seconds. No signup, no uploads to servers." steps={[{name:"Go to PDFTools Merge",text:"Go to PDFTools Merge"},{name:"Upload multiple PDFs by clicking or dragging files",text:"Upload multiple PDFs by clicking or dragging files"},{name:"Drag to reorder files into your desired sequence",text:"Drag to reorder files into your desired sequence"},{name:"Remove any unwanted files",text:"Remove any unwanted files"},{name:"Click Merge and download your combined PDF",text:"Click Merge and download your combined PDF"}]} />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</Link>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">How to Merge PDFs</h1>
        <p className="text-xs text-[var(--muted)] mb-6">June 27, 2026 · 4 min read</p>
        <p className="text-sm text-[var(--muted)] mb-4">Merging PDFs combines multiple documents into one organized file. Whether you&apos;re combining invoices, merging scanned pages, or compiling a report, <Link href="/merge" className="text-indigo-500 underline">PDFTools Merge</Link> makes it simple.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 mt-8">Step-by-Step: Merge PDFs</h2>
        <ol className="list-decimal pl-5 text-sm text-[var(--muted)] space-y-2 mb-6">
          <li>Go to <Link href="/merge" className="text-indigo-500 underline">PDFTools Merge</Link></li>
          <li>Upload multiple PDFs by clicking or dragging files</li>
          <li>Drag to reorder files into your desired sequence</li>
          <li>Remove any unwanted files</li>
          <li>Click Merge and download your combined PDF</li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 mt-8">When to Merge PDFs</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Combine Invoices</h3>
            <p className="text-xs text-[var(--muted)]">Merge monthly invoices into one document for accounting and record keeping.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Compile Reports</h3>
            <p className="text-xs text-[var(--muted)]">Join individual section PDFs into a complete report with proper ordering.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Assemble Contracts</h3>
            <p className="text-xs text-[var(--muted)]">Merge agreement pages, schedules, and exhibits into one contract document.</p>
          </div>
          <div className="border border-[var(--card-border)] rounded-xl p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Create eBooks</h3>
            <p className="text-xs text-[var(--muted)]">Combine individual chapters into a complete eBook or manual.</p>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 mb-6">
          <p className="text-sm text-[var(--muted)]"><strong>Pro tip:</strong> Use <Link href="/organize" className="text-indigo-500 underline">Organize Pages</Link> after merging to reorder, rotate, or delete specific pages.</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Merge PDFs Free</h2>
          <p className="text-sm text-white/80 mb-4">No uploads, no signup, works entirely in your browser.</p>
          <Link href="/merge" className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl hover:bg-white/90 transition">Merge PDFs Now →</Link>
        </div>
      </div>
    </>
  );
}
