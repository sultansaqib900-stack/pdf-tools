import Link from "next/link";
import ArticleJsonLd from "@/components/ArticleJsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const title = "How to Redact a PDF for a FOIA Request — Step-by-Step";
const description = "A careful PDF redaction workflow for FOIA records: preserve originals, mark authorized material, apply real redactions, and inspect every page before release.";
const url = "https://allaboutpdfediting.xyz/blog/redact-pdf-for-foia-request";

export default function RedactPdfForFoiaRequest() {
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
      <p className="text-xs text-[var(--muted)] mb-7">By Saqib · Published September 28, 2026 · 7 min read</p>

      <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 mb-7">
        <p><strong className="text-[var(--foreground)]">Important:</strong> This is a PDF-handling tutorial, not legal advice or a determination about what may be withheld. FOIA is a U.S. federal process; state and local public-records laws differ. If you are preparing an agency response, follow your agency&apos;s rules and let the authorized reviewer decide which material is exempt. If you are a requester sharing supporting records, do not alter originals or remove information the recipient requires.</p>
      </div>

      <p className="mb-5">A black box drawn over words is not necessarily a redaction. In some PDFs, the original text remains underneath and can still be selected, copied, or extracted. A safer workflow preserves an untouched source, identifies only the material you are authorized to redact, applies a real redaction process, and checks the exported copy before it is shared.</p>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">Before you redact a FOIA-related PDF</h2>
      <ul className="list-disc pl-5 space-y-2 mb-5">
        <li>Read the request, the agency&apos;s release instructions, and any required format or redaction-log procedure.</li>
        <li>Keep the original file in an approved, access-controlled location. Create a separate working copy; never overwrite the source record.</li>
        <li>Have the responsible reviewer identify the specific information and legal basis to redact. A PDF tool cannot decide whether a name, date, or passage is exempt.</li>
        <li>Check whether the document includes attachments, comments, annotations, form fields, bookmarks, or separate files that need their own review.</li>
      </ul>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">How to apply visible-area redactions to a PDF</h2>
      <ol className="list-decimal pl-5 space-y-4 mb-6">
        <li><strong className="text-[var(--foreground)]">Open a working copy.</strong> Use an approved device and a duplicate of the file, not the only preserved original.</li>
        <li><strong className="text-[var(--foreground)]">Open the <Link href="/redact" className="text-indigo-500 underline">Redact PDF tool</Link>.</strong> Select the PDF and wait for its pages to render. The free file limit is 10 MB; Premium supports files up to 100 MB.</li>
        <li><strong className="text-[var(--foreground)]">Mark only the authorized material.</strong> On each page, drag over the text, image, or area the reviewer has identified. Move through the whole document, including headers, footers, tables, and repeated identifiers. The tool does not determine whether a proposed redaction is legally appropriate.</li>
        <li><strong className="text-[var(--foreground)]">Apply redactions and download.</strong> Select <em>Apply Redactions &amp; Download</em> and save the resulting PDF as a new file. Do not mistake a preview rectangle or a black highlight for an applied redaction.</li>
        <li><strong className="text-[var(--foreground)]">Verify the output before release.</strong> Reopen the downloaded copy in a separate PDF viewer, inspect every marked page at high zoom, and confirm no neighboring text was covered or sensitive content left visible. Follow the agency&apos;s own validation and recordkeeping process.</li>
      </ol>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">Why a true redaction is different from a black shape</h2>
      <p className="mb-4">A visual rectangle can simply sit on top of original PDF text. If someone removes or moves that overlay, the words may reappear. PDFTools&apos; area-redaction workflow rebuilds each page from rendered pixels after drawing opaque black areas; it does not carry the original text and content streams into the exported pages. That is different from placing a shape over the original page.</p>
      <p className="mb-5">The trade-off is that the exported pages are flattened images: text is no longer selectable, and links, interactive form fields, and other page behavior may not remain usable. Inspect the output carefully and use an agency-approved process whenever one is required. A tool&apos;s technical redaction behavior does not certify that a disclosure is legally compliant.</p>

      <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-3">Final checks for a FOIA release copy</h2>
      <ul className="list-disc pl-5 space-y-2 mb-5">
        <li>Compare the output against the reviewer&apos;s approved redaction list; confirm every intended page and occurrence was handled.</li>
        <li>Check that redaction marks are opaque, fully cover the target, and do not hide non-exempt information nearby.</li>
        <li>Review the exported file, not just the editor preview. Keep a separate, unredacted original under the organization&apos;s retention and access rules.</li>
        <li>Review metadata, comments, attachments, and related files separately if the release process calls for it. Area redaction and metadata cleanup are different tasks; a metadata tool cannot replace a records review.</li>
        <li>Use the requested filename, page order, and delivery method. Do not upload sensitive records to a service unless your organization permits that service and workflow.</li>
      </ul>
      <p className="mb-5">For repeated exact terms, <Link href="/search-redact" className="text-indigo-500 underline">Search &amp; Redact</Link> can locate matching text in supported PDFs, but search or OCR can miss a match. Review every page manually; automated matching is an aid, not a completeness guarantee.</p>

      <div className="border border-[var(--card-border)] bg-[var(--card)] rounded-xl p-5 mt-8">
        <h2 className="font-bold text-[var(--foreground)] mb-2">Need to permanently cover areas in a PDF?</h2>
        <p className="mb-4">Use the area tool on a working copy, then verify the downloaded file against your organization&apos;s requirements.</p>
        <Link href="/redact" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Open Redact PDF &rarr;</Link>
      </div>

      <p className="mt-7">More reading: <Link href="/blog/redact-pdf-online" className="text-indigo-500 underline">How to redact a PDF securely</Link> · <Link href="/blog/clean-pdf-metadata" className="text-indigo-500 underline">PDF metadata and privacy</Link>.</p>
    </article>
  );
}
