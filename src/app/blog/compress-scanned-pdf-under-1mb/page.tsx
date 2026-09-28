import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const title = "How to Compress a Scanned PDF Under 1MB — Keep Text Legible";
const description = "Need a scanned PDF under 1 MB? Learn practical scan settings, compression trade-offs, a browser workflow, and checks to keep text readable before upload.";
const url = "https://allaboutpdfediting.xyz/blog/compress-scanned-pdf-under-1mb";

export default function CompressScannedPdfUnder1Mb() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 text-sm text-[var(--muted)] leading-relaxed">
      <ArticleJsonLd
        title={title}
        description={description}
        url={url}
        datePublished="2026-09-28"
        dateModified="2026-09-28"
      />
      <Breadcrumbs items={[
        { name: "Home", item: "https://allaboutpdfediting.xyz" },
        { name: "Blog", item: "https://allaboutpdfediting.xyz/blog" },
        { name: title, item: url },
      ]} />
      <Link href="/blog" className="text-indigo-500 hover:underline mb-6 inline-block">&larr; Back to blog</Link>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">{title}</h1>
      <p className="text-xs text-[var(--muted)] mb-7">By Saqib · Published September 28, 2026 · 6 min read</p>

      <p className="mb-5">A scanned PDF is usually a stack of page images, so its size depends on image resolution, color, page count, and how the scanner encoded each picture. Getting it below 1 MB is possible for some files, but no compressor can promise the same result for every scan without making the pages harder to read. Keep an untouched copy, check the upload portal&apos;s exact limit, and judge the output at normal reading size.</p>

      <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 mb-7">
        <p><strong className="text-[var(--foreground)]">First check what “1 MB” means.</strong> Some upload forms use 1,000,000 bytes while others use 1,048,576 bytes (1 MiB). If the limit is strict, aim a little below it rather than stopping at the displayed boundary—and never trade away legibility on an official or important document just to hit a number.</p>
      </div>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">Why a scanned PDF can be large</h2>
      <p className="mb-4">A scanner photographs each sheet and saves the result as pixels. A high-resolution, full-color scan can be many megabytes per page; a ten-page file can therefore exceed a portal limit even when the pages contain mostly plain text. The PDF may also include blank backs, repeated scans, or images saved at a higher quality than the destination needs.</p>
      <p className="mb-5">Look at the page count and inspect the source scan before compressing. If the file is already small or uses efficient image compression, running it through another compressor may not reduce it. Compression can also soften tiny print, stamps, handwritten notes, barcodes, and signatures, so size is only one part of the check.</p>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">A careful workflow for getting below 1 MB</h2>
      <ol className="list-decimal pl-5 space-y-4 mb-6">
        <li><strong className="text-[var(--foreground)]">Confirm the destination requirements.</strong> Check the maximum byte size, accepted file type, page-count rules, and whether the recipient requires color or a particular scan resolution. Keep the original scan unchanged.</li>
        <li><strong className="text-[var(--foreground)]">If you can rescan, adjust the source first.</strong> For ordinary text intended only for on-screen reading, a moderate resolution such as 150–200 dpi can be a reasonable test; small type, fine detail, archival copies, or print workflows may need 300 dpi or more. A grayscale or black-and-white scan can be smaller than a color scan, but only use it when color is not meaningful. Review a sample page before rescanning the whole set.</li>
        <li><strong className="text-[var(--foreground)]">Compress a copy in Balanced mode first.</strong> Open <Link href="/compress" className="text-indigo-500 underline">Compress PDF</Link>, select the scan, choose <em>Balanced</em>, and download the result. This mode rebuilds pages as compressed images, which can help with image-heavy scans but flattens selectable text and interactive form fields.</li>
        <li><strong className="text-[var(--foreground)]">If it is still too large, compare Maximum mode.</strong> Try <em>Maximum</em> on another copy and compare small text, thin lines, signatures, and stamps side by side. Maximum uses stronger image compression and can visibly soften details. Use the version that remains readable—not automatically the smallest one.</li>
        <li><strong className="text-[var(--foreground)]">Check the downloaded file itself.</strong> Confirm its actual size is below the portal&apos;s limit, open it, and inspect every page at 100% zoom. Make sure nothing is clipped, missing, or too faint, then test the exact file in the destination workflow if possible.</li>
      </ol>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">Why Lossless mode may not shrink a scan much</h2>
      <p className="mb-5">Lossless optimization is designed to preserve the document&apos;s visible content, selectable text, and form fields. It can remove redundant PDF structure, but it does not recompress a scan&apos;s page images in the same way as the visual modes. For image-only pages, a small change—or no change—can be normal. If retaining searchable text or fillable fields matters, however, lossless processing is the safer first test.</p>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">What if the PDF is still over 1 MB?</h2>
      <ul className="list-disc pl-5 space-y-2 mb-5">
        <li>Recheck whether you can create a lower-resolution or grayscale scan without losing information the recipient needs.</li>
        <li>Remove blank or duplicate pages only if the upload instructions allow it; use <Link href="/delete-pages" className="text-indigo-500 underline">Delete Pages</Link> on a working copy.</li>
        <li>If the recipient accepts multiple files, split the document into permitted parts with <Link href="/split" className="text-indigo-500 underline">Split PDF</Link>. Splitting does not make the complete set smaller, and it may not satisfy a one-file requirement.</li>
        <li>Ask the portal owner whether it accepts a larger file or another submission method. Do not assume an unreadable scan is acceptable because its byte count is lower.</li>
      </ul>
      <p className="mb-5">PDFTools keeps this compression workflow in your browser; the PDF itself is not uploaded to our server. The tool does not provide a target-size slider or guarantee an output under 1 MB. It keeps the original when a visual compression attempt would produce a larger file, so check the result before submitting.</p>

      <div className="border border-[var(--card-border)] bg-[var(--card)] rounded-xl p-5 mt-8">
        <h2 className="font-bold text-[var(--foreground)] mb-2">Try compressing a scanned PDF</h2>
        <p className="mb-4">Compare Balanced and Maximum on a copy, then check readability before uploading.</p>
        <Link href="/compress" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Open Compress PDF &rarr;</Link>
      </div>

      <p className="mt-7">Related guide: <Link href="/blog/how-to-compress-pdf" className="text-indigo-500 underline">How to compress a PDF</Link>.</p>
    </article>
  );
}
