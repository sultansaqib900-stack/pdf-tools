import type { Metadata } from "next";
import Link from "next/link";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "PDF Tools for Business — Secure Document Workflows",
  description: "Free PDF tools for business teams. Compress, merge, redact, compare and protect documents with no server uploads and no per-seat licence.",
  openGraph: {
    title: "PDF Tools for Business",
    description: "Secure business document workflows. No server uploads, no per-seat licensing, no signup.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-business",
  },
};

export default function PDFToolsForBusinessPage() {
  return (
    <AudiencePage
      audience="For business"
      slug="pdf-tools-for-business"
      h1="PDF Tools for Business Teams"
      intro={
        <>
          <p>
            At team scale, PDF handling stops being a personal-productivity question and becomes a
            procurement and data-governance one: how many seats are you paying for, who has approved
            the vendor, and where do the documents actually go when someone converts a file at
            17:45 on a Friday.
          </p>
          <p>
            The usual failure is not that people lack tools. It is that the approved tool is
            expensive and slow to request, so staff quietly paste confidential documents into
            whatever free converter ranks first on Google. Giving them something capable that never
            transmits the file removes that incentive.
          </p>
        </>
      }
      workflows={[
        {
          title: "Shadow IT is the real document risk",
          body: (
            <>
              <p>
                Every organisation has this pattern. Someone needs a 40&nbsp;MB board pack under an
                email limit, the licensed software is on a different machine or requires a request
                ticket, and the deadline is now. The file goes into an unvetted web service, and
                nobody records that it happened.
              </p>
              <p>
                That single upload can constitute a transfer of personal data to an unassessed
                processor, potentially across a border, with no agreement and no retention control.
                It rarely appears in any risk register because it leaves no trace inside your
                perimeter.
              </p>
              <p>
                A browser-local tool changes the calculus: it is as fast and frictionless as the
                risky option, but the document never leaves the endpoint. Staff take the convenient
                path either way — the useful intervention is making the convenient path safe.
              </p>
            </>
          ),
        },
        {
          title: "What browser-local processing means for your DPIA",
          body: (
            <>
              <p>
                The distinction that matters to a reviewer is between a policy and an architecture.
                A cloud tool that deletes files after an hour is making a commitment you must
                verify and periodically re-verify. Processing that happens in the browser transmits
                no document at all, so there is no processor relationship to assess for that step.
              </p>
              <p>
                This is independently checkable, which is what security reviewers actually want.
                Open developer tools, watch the Network tab during a conversion, and confirm no
                request carries the file body. Disconnect the network after page load and the tools
                keep working. Both are things a reviewer can reproduce without taking a vendor&apos;s
                word.
              </p>
              <p>
                Note the honest limit: the page itself is served over the internet and, like any
                website, uses analytics and advertising. Those are separate from document handling —
                the file is not part of any request — but a thorough review should look at both, and{" "}
                <Link href="/privacy" className="text-[var(--accent)] hover:underline">the privacy policy</Link>{" "}
                sets out what is collected.
              </p>
            </>
          ),
        },
        {
          title: "Redaction and disclosure before documents leave the building",
          body: (
            <>
              <p>
                Board minutes, due diligence packs, HR files and incident reports routinely go
                outside the organisation with parts that must not. The recurring failure is drawing
                a black rectangle over text, which does not remove it — the words remain in the file
                and can be copied straight out.
              </p>
              <p>
                <Link href="/redact" className="text-[var(--accent)] hover:underline">Redact PDF</Link>{" "}
                removes the content itself, and{" "}
                <Link href="/search-redact" className="text-[var(--accent)] hover:underline">Search &amp; Redact</Link>{" "}
                applies a term across a long document so you are not depending on someone reading
                every page. Follow with{" "}
                <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">metadata sanitising</Link>{" "}
                to strip author names, internal file paths and revision history, then{" "}
                <Link href="/flatten-pdf" className="text-[var(--accent)] hover:underline">flatten</Link>{" "}
                so no annotation layer survives. Verify with{" "}
                <Link href="/extract-text" className="text-[var(--accent)] hover:underline">text extraction</Link>{" "}
                before release.
              </p>
            </>
          ),
        },
        {
          title: "Contract review and version control",
          body: (
            <>
              <p>
                <Link href="/pdf-diff" className="text-[var(--accent)] hover:underline">PDF comparison</Link>{" "}
                belongs in any contract workflow. When a counterparty returns a marked-up agreement,
                a diff surfaces every change, including the ones not mentioned in the covering
                email. Reviewing two long drafts by eye reliably misses single-word amendments to
                liability caps and payment terms.
              </p>
              <p>
                Once executed,{" "}
                <Link href="/flatten-pdf" className="text-[var(--accent)] hover:underline">flatten</Link>{" "}
                the agreement and{" "}
                <Link href="/protect" className="text-[var(--accent)] hover:underline">apply a password</Link>{" "}
                where it will be circulated. For evidence bundles and numbered disclosure,{" "}
                <Link href="/bates-numbering" className="text-[var(--accent)] hover:underline">Bates numbering</Link>{" "}
                gives every page a stable reference.
              </p>
            </>
          ),
        },
        {
          title: "Licensing: buy depth where you need it, not everywhere",
          body: (
            <>
              <p>
                Per-seat PDF licensing is commonly over-provisioned because it is bought
                organisation-wide when only a minority need the advanced capability. Prepress,
                PDF/UA accessibility remediation, certified redaction and complex JavaScript forms
                genuinely require professional software; compress, merge, sign and convert do not.
              </p>
              <p>
                Auditing who uses which features usually finds most seats doing only the second
                category. Keeping a small number of full licences for specialists and moving routine
                work to free browser tools typically removes the large majority of the spend with no
                capability loss for the people affected.
              </p>
            </>
          ),
        },
        {
          title: "Deployment across a mixed fleet",
          body: (
            <>
              <p>
                Because there is nothing to install, there is no packaging, no MSI, no version drift
                across the estate and no administrator rights required. The tools run on Windows,
                macOS, Linux and ChromeOS through any modern browser, which covers contractors and
                BYOD devices where deploying licensed software is impractical.
              </p>
              <p>
                For repeatable high-volume work,{" "}
                <Link href="/batch" className="text-[var(--accent)] hover:underline">batch processing</Link>{" "}
                applies the same operation across many files, and{" "}
                <Link href="/bulk-rename" className="text-[var(--accent)] hover:underline">bulk rename</Link>{" "}
                enforces a consistent naming convention before documents enter a records system.
              </p>
            </>
          ),
        },
      ]}
      groups={[
        {
          heading: "Governance and disclosure",
          tools: [
            { href: "/redact", label: "Redact PDF", desc: "Remove content, not just cover it", icon: "redact" },
            { href: "/search-redact", label: "Search & Redact", desc: "Apply a term across a long document", icon: "search" },
            { href: "/metadata-sanitizer", label: "Clean metadata", desc: "Strip authors, paths and revisions", icon: "eraser" },
            { href: "/flatten-pdf", label: "Flatten PDF", desc: "Remove annotation and form layers", icon: "flatten" },
            { href: "/protect", label: "Protect PDF", desc: "Password-protect circulated documents", icon: "lock" },
            { href: "/extract-text", label: "Extract text", desc: "Verify a redaction before release", icon: "type" },
          ],
        },
        {
          heading: "Contracts and records",
          tools: [
            { href: "/pdf-diff", label: "Compare two PDFs", desc: "Catch every change in a returned draft", icon: "diff" },
            { href: "/sign", label: "Sign PDF", desc: "Execute agreements without printing", icon: "signature" },
            { href: "/bates-numbering", label: "Bates numbering", desc: "Stable references for disclosure", icon: "numbers" },
            { href: "/merge", label: "Merge PDF", desc: "Assemble board and evidence packs", icon: "merge" },
            { href: "/split", label: "Split PDF", desc: "Separate a pack into sections", icon: "split" },
            { href: "/organize", label: "Organize pages", desc: "Reorder and rotate before issue", icon: "organize" },
          ],
        },
        {
          heading: "Volume and everyday work",
          tools: [
            { href: "/batch", label: "Batch processing", desc: "Apply one operation across many files", icon: "layers" },
            { href: "/bulk-rename", label: "Bulk rename", desc: "Enforce a naming convention", icon: "tag" },
            { href: "/compress", label: "Compress PDF", desc: "Fit large packs under email limits", icon: "compress" },
            { href: "/ocr-pdf", label: "OCR PDF", desc: "Make scanned archives searchable", icon: "scan" },
            { href: "/pdf-to-excel", label: "PDF to Excel", desc: "Extract tabular data for analysis", icon: "fileSheet" },
            { href: "/word-to-pdf", label: "Word to PDF", desc: "Fix formatting before distribution", icon: "fileText" },
          ],
        },
      ]}
      faqs={[
        {
          question: "Is a browser-based PDF tool acceptable under our data protection policy?",
          answer:
            "Because the document is processed on the endpoint and never transmitted, no third-party processor receives it, which is the exposure most policies are written to control. Your reviewer can verify this directly by monitoring network activity during a conversion. The website itself uses analytics and advertising like any site, so review those separately from document handling.",
        },
        {
          question: "How do we stop staff uploading confidential files to random converters?",
          answer:
            "Prohibition alone rarely works, because the behaviour is driven by deadline pressure and friction. Providing a tool that is equally fast, requires no licence request and does not transmit the file removes the incentive, since the convenient option and the safe option become the same option.",
        },
        {
          question: "Can we reduce the number of paid PDF licences we hold?",
          answer:
            "Usually yes. Audit which staff genuinely need prepress output, accessibility remediation, certified redaction or advanced forms, and keep full licences for them. Users whose work is compressing, merging, signing and converting can move to free browser tools, which typically removes most of the spend without affecting capability.",
        },
        {
          question: "Does covering text with a black box redact a document?",
          answer:
            "No. The rectangle is drawn over the text while the characters remain in the file and can be copied out or recovered by text extraction. Use a tool that removes the underlying content, strip the metadata, flatten the document, then verify with text extraction before release.",
        },
        {
          question: "Do these tools work on managed and BYOD devices?",
          answer:
            "Yes. There is nothing to install and no administrator rights are needed, so they work across Windows, macOS, Linux and ChromeOS, including contractor and BYOD machines where deploying licensed desktop software is impractical.",
        },
        {
          question: "Can we process documents in bulk?",
          answer:
            "Batch processing applies the same operation across many files in one pass, and bulk renaming enforces a consistent naming convention before documents enter a records system. Because processing is local, throughput depends on the workstation rather than a service quota.",
        },
        {
          question: "Is there an API for automating document workflows?",
          answer:
            "API access is available with Premium. For server-side automation embedded in your own systems, a dedicated document API may fit better, since the core design here is browser-local processing rather than programmatic server integration.",
        },
      ]}
      closing={
        <>
          <p>
            The governance argument is simpler than it looks. Most document risk in an organisation
            comes not from the approved workflow but from the improvised one taken under time
            pressure, and improvisation is a response to friction.
          </p>
          <p>
            Removing the friction is the control. When the fastest available tool also happens to be
            the one that never transmits the file, the risky path stops being attractive — and that
            is more durable than a policy telling people not to take it.
          </p>
        </>
      }
    />
  );
}
