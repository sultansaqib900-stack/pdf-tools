import type { Metadata } from "next";
import Link from "next/link";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "PDF Tools for Lawyers — Redact & Protect Legal PDFs",
  description: "Free PDF tools for legal work: redact sensitive text, merge discovery, Bates number exhibits and protect client files. No uploads.",
  openGraph: {
    title: "Free PDF Tools for Lawyers — Secure Legal Document Processing",
    description: "Redact, merge, protect and Bates-number PDFs. All processing is local — client data never leaves your computer.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-lawyers",
  },
};

export default function PDFToolsForLawyersPage() {
  return (
    <AudiencePage
      audience="For lawyers"
      slug="pdf-tools-for-lawyers"
      h1="PDF Tools for Lawyers and Legal Teams"
      intro={
        <>
          <p>
            Legal document work has a constraint most PDF advice ignores: you often cannot upload
            the file. Model Rule 1.6 and its state equivalents require reasonable efforts to prevent
            disclosure of client information, and sending a privileged document to a third-party
            server for processing is a decision you would rather not have to defend.
          </p>
          <p>
            Every tool linked here runs inside your browser. The file is read by JavaScript and
            WebAssembly on your own machine, and no copy is transmitted. That is not a policy
            promise about deletion schedules — there is no server that receives the document in the
            first place, which is a materially different thing when opposing counsel asks how a
            production was prepared.
          </p>
        </>
      }
      workflows={[
        {
          title: "Redaction: the black box is not redaction",
          body: (
            <>
              <p>
                This is the single most consequential mistake in legal PDF handling, and it keeps
                producing sanctions and news stories. Drawing a black rectangle over text in a PDF
                annotator or image editor does not remove the text. It draws an opaque shape on a
                layer above it. The underlying characters remain in the content stream and can be
                recovered by selecting the area and copying, by running text extraction, or by
                deleting the annotation layer.
              </p>
              <p>
                Real redaction removes the content itself.{" "}
                <Link href="/redact" className="text-[var(--accent)] hover:underline">Redact PDF</Link>{" "}
                strips the selected content rather than masking it. For a term that recurs throughout
                a long production — a client name, an account number, a settlement figure —{" "}
                <Link href="/search-redact" className="text-[var(--accent)] hover:underline">Search &amp; Redact</Link>{" "}
                finds every instance across the document so you are not relying on visual inspection
                of four hundred pages.
              </p>
              <p>
                Always verify afterwards. Open the redacted output, attempt to select text in the
                redacted region, and run{" "}
                <Link href="/extract-text" className="text-[var(--accent)] hover:underline">text extraction</Link>{" "}
                over the file to confirm the terms are absent. Verification takes a minute and is the
                difference between a redaction and a rectangle.
              </p>
            </>
          ),
        },
        {
          title: "Metadata is the leak nobody checks",
          body: (
            <>
              <p>
                A PDF carries more than what renders on screen. Depending on how it was produced it
                may include the author name and Windows username, the originating file path, the
                software used, creation and revision timestamps, and in documents converted from
                Word, remnants of tracked changes and comments.
              </p>
              <p>
                Before a document goes to opposing counsel or into a public filing, run{" "}
                <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">the metadata sanitiser</Link>{" "}
                to strip those fields, and consider{" "}
                <Link href="/flatten-pdf" className="text-[var(--accent)] hover:underline">flattening</Link>{" "}
                the file, which merges form fields, annotations and layers into static page content
                so no interactive remnants survive.
              </p>
            </>
          ),
        },
        {
          title: "Bates numbering and assembling a production",
          body: (
            <>
              <p>
                A typical production sequence is: assemble the documents in order, apply sequential
                identifiers, then reduce the file for the filing portal. Do it in that order —
                numbering before assembly means renumbering after every insertion.
              </p>
              <p>
                <Link href="/merge" className="text-[var(--accent)] hover:underline">Merge</Link>{" "}
                the exhibits with drag-to-reorder,{" "}
                <Link href="/organize" className="text-[var(--accent)] hover:underline">reorder or rotate</Link>{" "}
                any pages that came in sideways from a scanner, then apply{" "}
                <Link href="/bates-numbering" className="text-[var(--accent)] hover:underline">Bates numbering</Link>{" "}
                with your prefix, padding and corner position. If a production needs to be broken
                into per-exhibit files afterwards,{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>{" "}
                handles ranges, and{" "}
                <Link href="/split-by-bookmarks" className="text-[var(--accent)] hover:underline">Split by bookmarks</Link>{" "}
                will use an existing outline as the break points.
              </p>
            </>
          ),
        },
        {
          title: "E-filing size limits",
          body: (
            <>
              <p>
                Most e-filing systems impose a per-document ceiling, commonly in the range of 10&nbsp;MB
                to 35&nbsp;MB, and scanned exhibits blow past it quickly because each page is an image.{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>{" "}
                will usually bring a scan-heavy filing under the limit without visibly degrading
                legibility.
              </p>
              <p>
                If compression alone is not enough, split the filing along a logical boundary rather
                than an arbitrary page count, so each part remains a coherent document. For scanned
                material that needs to be searchable — case law, deposition exhibits, discovery you
                received as images —{" "}
                <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR</Link>{" "}
                adds a text layer so the pages can be searched and cited.
              </p>
            </>
          ),
        },
        {
          title: "Working on a firm-managed laptop",
          body: (
            <>
              <p>
                Firm IT policies frequently block software installation, and getting a new desktop
                application approved can take weeks. Because these tools are a web page, there is
                nothing to install and no administrator rights required — they run in Chrome,
                Firefox, Edge and Safari.
              </p>
              <p>
                They also keep working with the network disconnected once the page has loaded, which
                is a useful property both for working on a train and for demonstrating to a security
                reviewer that the document is not going anywhere.
              </p>
            </>
          ),
        },
      ]}
      groups={[
        {
          heading: "Confidentiality and compliance",
          tools: [
            { href: "/redact", label: "Redact PDF", desc: "Permanently remove privileged content", icon: "redact" },
            { href: "/search-redact", label: "Search & Redact", desc: "Find and strip a term across a whole production", icon: "search" },
            { href: "/metadata-sanitizer", label: "Clean metadata", desc: "Strip author, paths, timestamps and revisions", icon: "eraser" },
            { href: "/flatten-pdf", label: "Flatten PDF", desc: "Merge annotations and form fields into the page", icon: "flatten" },
            { href: "/protect", label: "Protect PDF", desc: "Password-protect confidential case files", icon: "lock" },
            { href: "/unlock", label: "Unlock PDF", desc: "Remove a password you hold from a received file", icon: "unlock" },
          ],
        },
        {
          heading: "Assembling productions and filings",
          tools: [
            { href: "/merge", label: "Merge PDF", desc: "Combine exhibits and discovery in order", icon: "merge" },
            { href: "/split", label: "Split PDF", desc: "Separate briefs by section or exhibit", icon: "split" },
            { href: "/bates-numbering", label: "Bates numbering", desc: "Sequential identifiers with prefix and padding", icon: "numbers" },
            { href: "/organize", label: "Organize pages", desc: "Reorder and rotate scanned pages", icon: "organize" },
            { href: "/compress", label: "Compress PDF", desc: "Get filings under e-filing size limits", icon: "compress" },
            { href: "/add-page-numbers", label: "Page numbers", desc: "Number briefs and motions", icon: "hash" },
          ],
        },
        {
          heading: "Converting and reading",
          tools: [
            { href: "/ocr-pdf", label: "OCR PDF", desc: "Make scanned case law searchable", icon: "scan" },
            { href: "/pdf-to-word", label: "PDF to Word", desc: "Edit contract text in Word", icon: "fileWord" },
            { href: "/word-to-pdf", label: "Word to PDF", desc: "Convert drafts for filing", icon: "fileText" },
            { href: "/pdf-diff", label: "Compare two PDFs", desc: "Spot every change between contract drafts", icon: "diff" },
            { href: "/extract-text", label: "Extract text", desc: "Verify a redaction actually removed the words", icon: "type" },
            { href: "/image-to-pdf", label: "Image to PDF", desc: "Turn photos of signed documents into PDFs", icon: "image" },
          ],
        },
      ]}
      faqs={[
        {
          question: "Is browser-based PDF processing consistent with client confidentiality obligations?",
          answer:
            "Processing that happens entirely on your own device does not transmit client information to a third party, which is the disclosure risk that confidentiality rules are concerned with. Because no file is uploaded, there is no external processor to vet and no retention policy to rely on. You should still apply your firm's own judgement and any jurisdiction-specific requirements.",
        },
        {
          question: "Does drawing a black box over text redact it?",
          answer:
            "No. A black rectangle is a shape drawn on top of the text; the characters remain in the file and can be recovered by copying the region or running text extraction. Use a redaction tool that removes the underlying content, then verify by attempting to select and extract text from the redacted area.",
        },
        {
          question: "Can I redact the same term across an entire production?",
          answer:
            "Yes. Search and Redact locates every occurrence of a term across the document and removes it, which is far more reliable than visually scanning hundreds of pages. Always verify the output with text extraction before producing it.",
        },
        {
          question: "What metadata should be removed before producing a document?",
          answer:
            "Author name and system username, original file paths, creation and modification timestamps, the producing software, and any residual comments or tracked changes carried over from Word. A metadata sanitiser strips these; flattening the document additionally removes interactive annotation and form layers.",
        },
        {
          question: "How do I get a large scanned filing under an e-filing size limit?",
          answer:
            "Compress it first, since scanned pages are images and compress substantially with little visible quality loss. If it is still too large, split it along a logical boundary such as exhibit divisions rather than an arbitrary page count so each part stays coherent.",
        },
        {
          question: "Can I use these tools on a firm-issued laptop without IT approval?",
          answer:
            "There is nothing to install. The tools are a web page that runs in Chrome, Firefox, Edge or Safari, so no administrator rights or software approval process is involved. They also continue working after the network is disconnected, once the page has loaded.",
        },
        {
          question: "What is the file size limit?",
          answer:
            "The free tier is guided by a 10MB limit and Premium raises it to 100MB, which covers most discovery productions. Because files are processed locally rather than uploaded, the practical constraint is your computer's available memory rather than a network transfer.",
        },
      ]}
      closing={
        <>
          <p>
            The reason to prefer local processing for legal work is not that cloud tools are
            careless. It is that privilege is difficult to un-waive, and &ldquo;the vendor deletes
            files after an hour&rdquo; is a weaker position than &ldquo;the document never left the
            machine&rdquo;.
          </p>
          <p>
            You can confirm the claim rather than take it on faith: open your browser&apos;s
            developer tools with F12, select the Network tab, and process a file. No request
            containing the document body will appear. Disconnecting from the network after the page
            loads makes the same point more bluntly — the tools keep working.
          </p>
        </>
      }
    />
  );
}
