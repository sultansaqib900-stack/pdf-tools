import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <ArticleJsonLd
        title="How to Resize PDF Pages Online Free — Change to A4, Letter & Custom Sizes"
        description="Change page size of PDF documents online for free..."
        url="https://allaboutpdfediting.xyz/blog/resize-pdf-pages"
        datePublished="2026-06-24"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Resize PDF Pages Online Free — Change to A4, Letter &amp; Custom Sizes", item: "https://allaboutpdfediting.xyz/blog/resize-pdf-pages" }]} />
      <HowToJsonLd name="How to Resize PDF Pages Online Free — Change to A4, Letter &amp; Custom Sizes" description="Change page size of PDF documents online for free..." steps={[{name:"Go to the Resize PDF page",text:"Go to the Resize PDF page"},{name:"Upload your PDF file",text:"Upload your PDF file"},{name:"Choose a preset size (A4, Letter, Legal, etc.) or enter custom dimensions",text:"Choose a preset size (A4, Letter, Legal, etc.) or enter custom dimensions"},{name:"Click &quot;Resize&quot; and your updated PDF downloads automatically",text:"Click &quot;Resize&quot; and your updated PDF downloads automatically"}]} />
      <Link href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</Link>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">How to Resize PDF Pages Online Free — Change to A4, Letter & Custom Sizes</h1>
      <p className="text-sm text-[var(--muted)] mb-8">June 24, 2026 &middot; 3 min read</p>

      <div className="text-[var(--muted)] space-y-4 leading-relaxed">
        <p>Need to change the page size of a PDF document? Whether you're submitting to a portal that requires A4, printing on Letter paper, or formatting for a specific device, resizing PDF pages is quick and easy with free online tools.</p>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">When to Resize PDF Pages</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Submission requirements</strong> — Many institutions require specific page sizes (e.g., A4 for European universities)</li>
          <li><strong>Printing</strong> — Match your document to the paper size you're using</li>
          <li><strong>Standardization</strong> — Make all pages in a document the same size</li>
          <li><strong>Digital publishing</strong> — Prepare documents for e-readers or tablets</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">How to Resize a PDF Online Free</h2>
        <p>Using <Link href="/resize" className="text-indigo-500 hover:underline">PDFTools Resize PDF</Link> tool:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to the <Link href="/resize" className="text-indigo-500 hover:underline">Resize PDF page</Link></li>
          <li>Upload your PDF file</li>
          <li>Choose a preset size (A4, Letter, Legal, etc.) or enter custom dimensions</li>
          <li>Click &quot;Resize&quot; and your updated PDF downloads automatically</li>
        </ol>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">Standard Page Sizes</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>A4</strong> — 210 × 297 mm (most common worldwide)</li>
          <li><strong>Letter</strong> — 8.5 × 11 inches (US and Canada)</li>
          <li><strong>Legal</strong> — 8.5 × 14 inches (US legal documents)</li>
          <li><strong>A3</strong> — 297 × 420 mm (large format)</li>
        </ul>

        <p className="pt-4">Try the <Link href="/resize" className="text-indigo-500 font-medium hover:underline">free online PDF resizer</Link> now.</p>

        <p className="pt-4">If your PDF has uneven margins or excess whitespace, read our guide on <Link href="/blog/crop-pdf-margins" className="text-indigo-500 font-medium hover:underline">how to crop PDF margins</Link> to clean up your document.</p>
      </div>
    </article>
  );
}
