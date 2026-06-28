import type { Metadata } from "next";
export const metadata: Metadata = { title: "How to Convert Images to PDF Online Free — JPG, PNG to PDF", description: "Convert images to PDF online for free. Turn JPG, PNG, BMP and other image formats into PDF documents instantly." };
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <ArticleJsonLd title="How to Convert Images to PDF Online Free" description="Convert images to PDF online for free." url="https://allaboutpdfediting.xyz/blog/convert-image-to-pdf" datePublished="2026-06-25" />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Convert Images to PDF Online Free", item: "https://allaboutpdfediting.xyz/blog/convert-image-to-pdf" }]} />
      <HowToJsonLd name="How to Convert Images to PDF Online Free" description="Convert images to PDF online for free." steps={[{name:"Open the converter — Go to our Image to PDF tool.",text:"Open the converter — Go to our Image to PDF tool."},{name:"Upload your images — Select one or multiple images. Drag to reorder them.",text:"Upload your images — Select one or multiple images. Drag to reorder them."},{name:"Choose page size — Select the output page size (A4, Letter, or match image si...",text:"Choose page size — Select the output page size (A4, Letter, or match image size)."},{name:"Download your PDF — The combined PDF is ready instantly.",text:"Download your PDF — The combined PDF is ready instantly."}]} />
      <a href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</a>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">How to Convert Images to PDF Online Free</h1>
      <p className="text-sm text-[var(--muted)] mb-8">4 min read · Updated June 2026</p>
      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">
        <p>Converting images to PDF is one of the most common PDF tasks. Whether you are combining scanned photos into a digital album, sending a batch of receipts to your accountant, or creating a portfolio from separate images, our <a href="/image-to-pdf" className="text-indigo-500 underline">free image to PDF converter</a> makes it effortless.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Supported Image Formats</h2>
        <p>Our tool supports all major image formats: JPG, PNG, BMP, GIF, WEBP, and TIFF. You can upload multiple images at once and they will be combined into a single PDF document, with each image becoming one page. The conversion preserves image quality and color accuracy.</p>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">How to Convert Image to PDF</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li><strong>Open the converter</strong> — Go to our <a href="/image-to-pdf" className="text-indigo-500 underline">Image to PDF tool</a>.</li>
          <li><strong>Upload your images</strong> — Select one or multiple images. Drag to reorder them.</li>
          <li><strong>Choose page size</strong> — Select the output page size (A4, Letter, or match image size).</li>
          <li><strong>Download your PDF</strong> — The combined PDF is ready instantly.</li>
        </ol>

        <h2 className="text-xl font-bold text-[var(--foreground)] pt-4">Common Use Cases</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Creating PDF photo albums from vacation or event photos</li>
          <li>Converting scanned documents (phone photos of paper) into a single PDF</li>
          <li>Building professional portfolios from design work screenshots</li>
          <li>Sending multiple receipts or invoices as one organized document</li>
        </ul>

        <p>All processing happens locally in your browser. Your images never leave your device, ensuring complete privacy for sensitive documents such as identification cards, contracts, or medical records.</p>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mt-6">
          <p className="font-semibold text-[var(--foreground)] mb-2">Ready to convert images to PDF?</p>
          <a href="/image-to-pdf" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition">Convert Now →</a>
        </div>
      </div>
    </article>
  );
}
