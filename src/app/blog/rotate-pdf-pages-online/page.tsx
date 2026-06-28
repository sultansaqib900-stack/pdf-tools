import type { Metadata } from "next";
export const metadata: Metadata = { title: "How to Rotate PDF Pages Online Free — Fix Upside-Down Documents", description: "Rotate PDF pages online for free. Fix upside-down or sideways PDF pages by rotating 90, 180, or 270 degrees." };
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <ArticleJsonLd title="How to Rotate PDF Pages Online Free" description="Rotate PDF pages online for free." url="https://allaboutpdfediting.xyz/blog/rotate-pdf-pages-online" datePublished="2026-06-25" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Rotate PDF Pages Online Free", item: "https://allaboutpdfediting.xyz/blog/rotate-pdf-pages-online" }]} />
      <HowToJsonLd name="How to Rotate PDF Pages Online Free" description="Rotate PDF pages online for free." steps={[{name:"Open the rotator — Go to our PDF rotate tool.",text:"Open the rotator — Go to our PDF rotate tool."},{name:"Upload your PDF — Select the file with misoriented pages.",text:"Upload your PDF — Select the file with misoriented pages."},{name:"Choose rotation — Select which pages to rotate and by how much.",text:"Choose rotation — Select which pages to rotate and by how much."},{name:"Download — Your corrected PDF is ready instantly.",text:"Download — Your corrected PDF is ready instantly."}]} />
      <a href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">How to Rotate PDF Pages Online Free</h1>
      <p className="text-sm text-[var(--muted)] mb-8">3 min read · Updated June 2026</p>
      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">
        <p>Nothing is more frustrating than opening a PDF only to find pages upside down or sideways. Whether you scanned documents in the wrong orientation, received a misaligned file from a colleague, or combined pages from different sources, our <a href="/rotate" className="text-indigo-500 underline">free PDF rotator tool</a> fixes it instantly.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Rotation Options</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>90° clockwise</strong> — Fix landscape pages displayed as portrait</li>
          <li><strong>90° counter-clockwise</strong> — Fix sideways scans and images</li>
          <li><strong>180°</strong> — Flip upside-down pages right-side up</li>
          <li><strong>Rotate specific pages</strong> — Choose individual pages or apply to the entire document</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">How to Rotate a PDF Page</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li><strong>Open the rotator</strong> — Go to our <a href="/rotate" className="text-indigo-500 underline">PDF rotate tool</a>.</li>
          <li><strong>Upload your PDF</strong> — Select the file with misoriented pages.</li>
          <li><strong>Choose rotation</strong> — Select which pages to rotate and by how much.</li>
          <li><strong>Download</strong> — Your corrected PDF is ready instantly.</li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Common Scenarios</h2>
        <p>PDF page rotation is essential for fixing scanned documents where the feeder grabbed pages at different angles. Smartphone photos converted to PDF often have mixed orientations depending on how you held the phone. Even digital PDFs created from different source files can have inconsistent page directions. Instead of re-scanning or re-creating the document, simply rotate the affected pages with a few clicks. Our tool processes everything locally, so your document never leaves your device.</p>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mt-6">
          <p className="font-semibold text-[var(--foreground)] mb-2">Need to fix page orientation?</p>
          <a href="/rotate" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition">Rotate PDF Now →</a>
        </div>
      </div>
    </article>
  );
}
