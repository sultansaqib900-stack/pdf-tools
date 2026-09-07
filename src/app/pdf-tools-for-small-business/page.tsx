import type { Metadata } from "next";
import Link from "next/link";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "PDF Tools for Small Business — Invoices & Contracts",
  description: "Free PDF tools for small business: merge invoices, convert contracts, sign agreements and compress files for email. No signup.",
  openGraph: {
    title: "Free PDF Tools for Small Business",
    description: "Invoices, contracts, quotes and signed agreements. Free, browser-based, nothing uploaded, no signup.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-small-business",
  },
};

export default function PDFToolsForSmallBusinessPage() {
  return (
    <AudiencePage
      audience="For small business"
      slug="pdf-tools-for-small-business"
      h1="PDF Tools for Small Business"
      intro={
        <>
          <p>
            Running a small business means handling documents constantly without a document
            department: invoices out, signed contracts back, quotes, receipts for the accountant,
            insurance forms, supplier agreements. It is rarely complicated work, but it is
            relentless, and paying a per-seat subscription for it is hard to justify.
          </p>
          <p>
            Everything below is free and runs in your browser. There is no account, nothing to
            install on the laptop you also use for everything else, and no file is uploaded — which
            matters when the document is a signed contract or a customer&apos;s bank details.
          </p>
        </>
      }
      workflows={[
        {
          title: "Invoices, quotes and getting paid",
          body: (
            <>
              <p>
                Send invoices as PDF, not as a word processor file. A PDF renders identically
                everywhere, cannot be casually altered, and looks settled rather than provisional.{" "}
                <Link href="/word-to-pdf" className="text-[var(--accent)] hover:underline">Word to PDF</Link>{" "}
                handles the conversion and locks your layout so the totals do not reflow on someone
                else&apos;s machine.
              </p>
              <p>
                For a monthly statement covering several jobs,{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">merge</Link>{" "}
                the individual invoices into one document. If a client sends a remittance or
                purchase order as a scan,{" "}
                <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR</Link>{" "}
                makes it searchable so you can find a reference number later without opening every
                file in the folder.
              </p>
            </>
          ),
        },
        {
          title: "Contracts: sign, compare, and know what changed",
          body: (
            <>
              <p>
                <Link href="/sign" className="text-[var(--accent)] hover:underline">Sign PDF</Link>{" "}
                lets you add a signature and return an agreement in a couple of minutes rather than
                printing, signing, scanning and emailing back.{" "}
                <Link href="/fill-form" className="text-[var(--accent)] hover:underline">Fill forms</Link>{" "}
                completes supplier onboarding and insurance paperwork without printing at all.
              </p>
              <p>
                The tool worth adopting as a habit is{" "}
                <Link href="/pdf-diff" className="text-[var(--accent)] hover:underline">PDF comparison</Link>.
                When a counterparty returns &ldquo;a few small changes&rdquo; to a contract, comparing
                their version against yours shows every difference, including the payment-terms
                clause that quietly moved from 30 days to 60. Reading two drafts side by side misses
                things; a diff does not.
              </p>
              <p>
                Once a contract is executed,{" "}
                <Link href="/flatten-pdf" className="text-[var(--accent)] hover:underline">flatten</Link>{" "}
                it so form fields and annotations become fixed page content and the final version
                cannot be edited by accident.
              </p>
            </>
          ),
        },
        {
          title: "Email limits and file size",
          body: (
            <>
              <p>
                Most business email caps attachments around 20&nbsp;MB to 25&nbsp;MB. A scanned
                contract, a photo-heavy proposal or a set of receipts exceeds that easily, and the
                bounce usually arrives after you have moved on.{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>{" "}
                solves it, with the largest savings on exactly the scanned documents that cause the
                problem.
              </p>
              <p>
                For a proposal with many product photographs, compress before sending rather than
                cutting content. A client is far more likely to open a 4&nbsp;MB attachment on their
                phone than a 30&nbsp;MB one.
              </p>
            </>
          ),
        },
        {
          title: "Bookkeeping and the year-end handover",
          body: (
            <>
              <p>
                Accountants generally want receipts and statements organised, not a folder of phone
                photos.{" "}
                <Link href="/image-to-pdf" className="text-[var(--accent)] hover:underline">Image to PDF</Link>{" "}
                converts photographed receipts, and merging them by month produces something usable
                instead of two hundred loose images.
              </p>
              <p>
                <Link href="/pdf-to-excel" className="text-[var(--accent)] hover:underline">PDF to Excel</Link>{" "}
                extracts tables from bank statements and supplier invoices into a spreadsheet, which
                saves hours of retyping at year end. If your accountant needs the files named
                consistently,{" "}
                <Link href="/bulk-rename" className="text-[var(--accent)] hover:underline">bulk rename</Link>{" "}
                can apply a pattern across the whole batch.
              </p>
            </>
          ),
        },
        {
          title: "Customer data is your liability too",
          body: (
            <>
              <p>
                Small businesses hold genuinely sensitive material: customer addresses, bank details
                on invoices, employee records, signed contracts. GDPR and equivalent regimes apply
                regardless of company size, and uploading those documents to a free online converter
                means a third party has processed personal data on your behalf, usually with no
                agreement in place.
              </p>
              <p>
                Local processing avoids that entirely. Where a document must be shared,{" "}
                <Link href="/protect" className="text-[var(--accent)] hover:underline">password-protect</Link>{" "}
                it and send the password separately, use{" "}
                <Link href="/redact" className="text-[var(--accent)] hover:underline">redaction</Link>{" "}
                to genuinely remove details rather than covering them, and run{" "}
                <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">the metadata sanitiser</Link>{" "}
                so internal file paths and author names do not travel with the file.
              </p>
            </>
          ),
        },
      ]}
      groups={[
        {
          heading: "Invoicing and sales documents",
          tools: [
            { href: "/word-to-pdf", label: "Word to PDF", desc: "Send invoices and quotes as PDF", icon: "fileText" },
            { href: "/merge", label: "Merge PDF", desc: "Combine invoices into one statement", icon: "merge" },
            { href: "/compress", label: "Compress PDF", desc: "Get proposals under email limits", icon: "compress" },
            { href: "/watermark", label: "Watermark", desc: "Mark quotes DRAFT or PAID", icon: "droplet" },
            { href: "/add-page-numbers", label: "Page numbers", desc: "Number long proposals", icon: "hash" },
            { href: "/qr-stamp", label: "QR code stamp", desc: "Add a payment or booking link", icon: "qr" },
          ],
        },
        {
          heading: "Contracts and agreements",
          tools: [
            { href: "/sign", label: "Sign PDF", desc: "Sign and return without printing", icon: "signature" },
            { href: "/fill-form", label: "Fill forms", desc: "Complete supplier and insurance forms", icon: "form" },
            { href: "/pdf-diff", label: "Compare two PDFs", desc: "Catch every change in a returned draft", icon: "diff" },
            { href: "/flatten-pdf", label: "Flatten PDF", desc: "Lock an executed contract", icon: "flatten" },
            { href: "/protect", label: "Protect PDF", desc: "Password-protect before sending", icon: "lock" },
            { href: "/unlock", label: "Unlock PDF", desc: "Open a protected file you have rights to", icon: "unlock" },
          ],
        },
        {
          heading: "Bookkeeping and records",
          tools: [
            { href: "/image-to-pdf", label: "Image to PDF", desc: "Photographed receipts into PDFs", icon: "image" },
            { href: "/pdf-to-excel", label: "PDF to Excel", desc: "Statements and invoices into a spreadsheet", icon: "fileSheet" },
            { href: "/ocr-pdf", label: "OCR PDF", desc: "Make scanned paperwork searchable", icon: "scan" },
            { href: "/bulk-rename", label: "Bulk rename", desc: "Name a batch of files consistently", icon: "tag" },
            { href: "/redact", label: "Redact PDF", desc: "Remove customer details properly", icon: "redact" },
            { href: "/metadata-sanitizer", label: "Clean metadata", desc: "Strip author and file paths", icon: "eraser" },
          ],
        },
      ]}
      faqs={[
        {
          question: "What is the cheapest way to handle business PDFs?",
          answer:
            "For compressing, merging, converting, signing and form filling, free browser-based tools cover the work without a subscription. Paid desktop software is worth it if you need prepress output, accessibility remediation or certified redaction, which most small businesses never touch.",
        },
        {
          question: "Can I legally sign a contract with an electronic signature?",
          answer:
            "Electronic signatures are legally recognised for most commercial agreements in the US under the ESIGN Act and in the EU and UK under eIDAS. Certain document types such as wills and some property instruments have stricter requirements, so check the rules for your jurisdiction and document type where the stakes are high.",
        },
        {
          question: "How do I see what a client changed in a contract they returned?",
          answer:
            "Run both versions through a PDF comparison tool. It highlights every difference between the two documents, which catches quiet edits to payment terms or liability clauses that are easy to miss when reading drafts side by side.",
        },
        {
          question: "Is it GDPR-compliant to use an online PDF tool on customer documents?",
          answer:
            "Uploading personal data to a third-party service generally makes that service a data processor, which requires an appropriate agreement and due diligence. Tools that process files locally in your browser avoid this, because no personal data is transmitted to another party in the first place.",
        },
        {
          question: "How do I get a large proposal under my email attachment limit?",
          answer:
            "Compress it. Business email typically caps attachments around 20MB to 25MB, and image-heavy proposals or scanned contracts compress substantially with little visible quality loss, which is preferable to removing content.",
        },
        {
          question: "How do I extract data from supplier invoices for bookkeeping?",
          answer:
            "A PDF to Excel tool pulls tables out of statements and invoices into a spreadsheet, avoiding manual retyping at year end. For scanned paperwork, run OCR first so the text is machine-readable before extraction.",
        },
        {
          question: "Do I need to install anything or create an account?",
          answer:
            "No. The tools run in a browser tab with no installation and no signup, which means they also work on a Chromebook or a locked-down machine where you cannot install desktop software.",
        },
      ]}
      closing={
        <>
          <p>
            The habit worth building is treating a client contract the way you would treat their card
            details. Free online converters are convenient precisely because nobody reads what
            happens to the file afterwards.
          </p>
          <p>
            Local processing means the question does not arise, and you can check rather than trust:
            press F12, open the Network tab, and watch that your document never appears in a request.
          </p>
        </>
      }
    />
  );
}
