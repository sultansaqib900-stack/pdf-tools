import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import HowToJsonLd from "@/components/HowToJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <ArticleJsonLd
        title="How to Crop PDF Margins Online Free — Remove Whitespace"
        description="Remove unwanted margins and whitespace from PDF pages online for free..."
        url="https://allaboutpdfediting.xyz/blog/crop-pdf-margins"
        datePublished="2026-06-24"
      />
      <BreadcrumbJsonLd items={[{ name: "Home", item: "https://allaboutpdfediting.xyz" }, { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" }, { name: "How to Crop PDF Margins Online Free — Remove Whitespace", item: "https://allaboutpdfediting.xyz/blog/crop-pdf-margins" }]} />
      <HowToJsonLd name="How to Crop PDF Margins Online Free — Remove Whitespace" description="Remove unwanted margins and whitespace from PDF pages online for free..." steps={[{name:"Go to the Crop PDF page",text:"Go to the Crop PDF page"},{name:"Upload your PDF file",text:"Upload your PDF file"},{name:"Enter the amount to crop from each side (top, bottom, left, right)",text:"Enter the amount to crop from each side (top, bottom, left, right)"},{name:"Choose points or millimeters as your unit",text:"Choose points or millimeters as your unit"},{name:"Click &quot;Crop PDF&quot; and download the result",text:"Click &quot;Crop PDF&quot; and download the result"}]} />
      <Link href="/blog" className="text-sm text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</Link>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">How to Crop PDF Margins Online Free — Remove Whitespace</h1>
      <p className="text-sm text-[var(--muted)] mb-8">June 24, 2026 &middot; 3 min read</p>

      <div className="text-[var(--muted)] space-y-4 leading-relaxed">
        <p>Excessive whitespace around PDF content makes documents look unprofessional and wastes paper when printing. Cropping away those margins gives you a cleaner, more focused document.</p>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">Why Crop a PDF?</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Remove scanner borders</strong> — Scanned pages often have black edges or excess white space</li>
          <li><strong>Fit content to screen</strong> — Eliminate large margins for better on-screen reading</li>
          <li><strong>Save paper</strong> — Less whitespace means more content per page when printing</li>
          <li><strong>Professional appearance</strong> — Tight margins look cleaner and more polished</li>
        </ul>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">How to Crop a PDF Online Free</h2>
        <p>Using <Link href="/crop" className="text-indigo-500 hover:underline">PDFTools Crop PDF</Link> tool:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to the <Link href="/crop" className="text-indigo-500 hover:underline">Crop PDF page</Link></li>
          <li>Upload your PDF file</li>
          <li>Enter the amount to crop from each side (top, bottom, left, right)</li>
          <li>Choose points or millimeters as your unit</li>
          <li>Click &quot;Crop PDF&quot; and download the result</li>
        </ol>

        <h2 className="text-xl font-semibold text-[var(--foreground)] pt-4">Tips for Cropping</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Start with small values (10-20 points) and check the result</li>
          <li>Use the <Link href="/resize" className="text-indigo-500 hover:underline">Resize PDF</Link> tool if you need to change the overall page size</li>
          <li>Different pages may need different crop amounts — try the <Link href="/split" className="text-indigo-500 hover:underline">Split PDF</Link> tool first if needed</li>
        </ul>

        <p className="pt-4">Try the <Link href="/crop" className="text-indigo-500 font-medium hover:underline">free online PDF cropper</Link> now.</p>

        <p className="pt-4">Need to change the overall page size instead? Read our guide on <Link href="/blog/resize-pdf-pages" className="text-indigo-500 font-medium hover:underline">how to resize PDF pages</Link> for A4, Letter, and custom sizes.</p>
      </div>
    </article>
  );
}
