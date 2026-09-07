import type { Metadata } from "next";
import Link from "next/link";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "PDF Tools for Students — Compress, Merge & Annotate",
  description: "Free PDF tools for students: compress lecture slides, merge research papers, annotate readings and convert assignments. No signup.",
  openGraph: {
    title: "Free PDF Tools for College Students",
    description: "Compress lecture slides, merge research papers, annotate readings and convert assignments. Free, no signup, nothing uploaded.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-students",
  },
};

export default function PDFToolsForStudentsPage() {
  return (
    <AudiencePage
      audience="For students"
      slug="pdf-tools-for-students"
      h1="PDF Tools for Students"
      intro={
        <>
          <p>
            Almost every student PDF problem is one of four things: a file too large to submit, a
            pile of documents that needs to become one document, a scanned reading you cannot search,
            or an assignment in the wrong format an hour before the deadline.
          </p>
          <p>
            All of the tools below are free, need no account, and run in your browser rather than on
            a server — which matters when campus wifi is slow, because there is no upload to wait
            for, and it means they still work when the connection drops mid-submission.
          </p>
        </>
      }
      workflows={[
        {
          title: "The submission portal rejected your file for being too large",
          body: (
            <>
              <p>
                Canvas, Blackboard, Moodle and Turnitin all cap upload size, often around 20&nbsp;MB
                to 40&nbsp;MB, and a dissertation full of figures or a scanned lab notebook exceeds it
                easily.{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>{" "}
                is almost always enough, and the savings are largest exactly where you need them —
                image-heavy and scanned documents.
              </p>
              <p>
                Keep the original file. Compression is lossy for images, so if a marker needs to zoom
                into a diagram you want the uncompressed version still on disk. Submit the compressed
                copy, archive the original.
              </p>
            </>
          ),
        },
        {
          title: "Turning a stack of files into one submission",
          body: (
            <>
              <p>
                Coursework is often submitted as a single PDF: cover sheet, essay, appendices,
                signed declaration, sometimes photographed handwritten work.{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">Merge PDF</Link>{" "}
                combines them with drag-to-reorder, so you can fix the sequence before exporting.
              </p>
              <p>
                If part of the submission is a photo of handwritten work or a printed form, convert
                it first with{" "}
                <Link href="/image-to-pdf" className="text-[var(--accent)] hover:underline">Image to PDF</Link>{" "}
                or{" "}
                <Link href="/scan-to-pdf" className="text-[var(--accent)] hover:underline">Scan to PDF</Link>,
                which straightens and sizes phone photos into something that looks deliberate rather
                than like a snapshot. Pages that came out sideways can be fixed with{" "}
                <Link href="/rotate" className="text-[var(--accent)] hover:underline">Rotate</Link>, and{" "}
                <Link href="/add-page-numbers" className="text-[var(--accent)] hover:underline">page numbers</Link>{" "}
                are worth adding if the rubric asks for them.
              </p>
            </>
          ),
        },
        {
          title: "You cannot search a scanned reading",
          body: (
            <>
              <p>
                Library scans and older journal PDFs are frequently images of pages rather than text,
                so Ctrl+F finds nothing and you cannot quote without retyping.{" "}
                <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR PDF</Link>{" "}
                adds a text layer underneath the image, which makes the document searchable and lets
                you copy quotations accurately.
              </p>
              <p>
                Once it is searchable,{" "}
                <Link href="/extract-text" className="text-[var(--accent)] hover:underline">Extract text</Link>{" "}
                will pull the whole thing into plain text for note-taking, and{" "}
                <Link href="/word-counter" className="text-[var(--accent)] hover:underline">the word counter</Link>{" "}
                gives you a defensible number for a word-limited assignment — count the PDF you are
                actually submitting, since a Word count and a PDF count can differ once footnotes
                and captions are involved.
              </p>
            </>
          ),
        },
        {
          title: "Reading and annotating without buying software",
          body: (
            <>
              <p>
                For working through a set reading,{" "}
                <Link href="/annotate" className="text-[var(--accent)] hover:underline">Annotate PDF</Link>{" "}
                lets you highlight and add comments and export the marked-up copy. If a two-hundred
                page PDF contains one forty-page chapter you actually need,{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>{" "}
                extracts that range so your tablet is not loading the whole book each time.
              </p>
              <p>
                For dense material,{" "}
                <Link href="/chat-pdf" className="text-[var(--accent)] hover:underline">Chat with PDF</Link>{" "}
                can help you locate where a concept is discussed across a long document. Use it to
                navigate and to check your understanding, not to generate submitted text — the
                academic misconduct rules at every institution treat that as a serious offence, and
                the point of the reading is that you can discuss it.
              </p>
            </>
          ),
        },
        {
          title: "Group projects and format problems",
          body: (
            <>
              <p>
                When four people contribute sections in different applications, the reliable fix is to
                convert everything to PDF and merge, rather than fighting Word styles.{" "}
                <Link href="/word-to-pdf" className="text-[var(--accent)] hover:underline">Word to PDF</Link>{" "}
                keeps formatting stable across machines, which is what stops a document that looked
                fine on one laptop from reflowing on another.
              </p>
              <p>
                Going the other way,{" "}
                <Link href="/pdf-to-word" className="text-[var(--accent)] hover:underline">PDF to Word</Link>{" "}
                is useful when you are given a template as a PDF and need to edit it. If you are
                submitting something confidential such as a mitigating-circumstances form, note that
                nothing you open here is uploaded anywhere.
              </p>
            </>
          ),
        },
      ]}
      groups={[
        {
          heading: "Getting an assignment submitted",
          tools: [
            { href: "/compress", label: "Compress PDF", desc: "Get under the portal's upload limit", icon: "compress" },
            { href: "/merge", label: "Merge PDF", desc: "Combine everything into one submission", icon: "merge" },
            { href: "/image-to-pdf", label: "Image to PDF", desc: "Photos of handwritten work into a PDF", icon: "image" },
            { href: "/scan-to-pdf", label: "Scan to PDF", desc: "Clean scans from phone photos", icon: "scan" },
            { href: "/rotate", label: "Rotate PDF", desc: "Fix sideways scanned pages", icon: "rotate" },
            { href: "/add-page-numbers", label: "Page numbers", desc: "Number pages as the rubric requires", icon: "hash" },
          ],
        },
        {
          heading: "Reading, research and note-taking",
          tools: [
            { href: "/ocr-pdf", label: "OCR PDF", desc: "Make a scanned reading searchable", icon: "scan" },
            { href: "/annotate", label: "Annotate PDF", desc: "Highlight and comment on readings", icon: "annotate" },
            { href: "/split", label: "Split PDF", desc: "Pull one chapter out of a huge file", icon: "split" },
            { href: "/extract-text", label: "Extract text", desc: "Pull quotations out accurately", icon: "type" },
            { href: "/word-counter", label: "Word counter", desc: "Check against a word limit", icon: "hash" },
            { href: "/chat-pdf", label: "Chat with PDF", desc: "Find where a topic is discussed", icon: "sparkles" },
          ],
        },
        {
          heading: "Format conversions",
          tools: [
            { href: "/word-to-pdf", label: "Word to PDF", desc: "Lock formatting before submitting", icon: "fileText" },
            { href: "/pdf-to-word", label: "PDF to Word", desc: "Edit a template you were given", icon: "fileWord" },
            { href: "/pdf-to-images", label: "PDF to images", desc: "Pull figures out for a presentation", icon: "image" },
            { href: "/pdf-to-excel", label: "PDF to Excel", desc: "Get a data table into a spreadsheet", icon: "fileSheet" },
            { href: "/delete-pages", label: "Delete pages", desc: "Remove blank or draft pages", icon: "delete" },
            { href: "/protect", label: "Protect PDF", desc: "Password-protect a shared draft", icon: "lock" },
          ],
        },
      ]}
      faqs={[
        {
          question: "How do I make a PDF small enough to submit to Canvas or Turnitin?",
          answer:
            "Run it through a compressor. Submission portals typically cap uploads around 20MB to 40MB, and image-heavy or scanned documents compress substantially with little visible quality loss. Keep the uncompressed original in case a marker needs to zoom into a figure.",
        },
        {
          question: "How do I combine several files into one PDF for submission?",
          answer:
            "Convert anything that is not already a PDF, then merge. Photos of handwritten work can be converted with an image-to-PDF tool first, and the merge tool lets you drag pages into the right order before exporting a single file.",
        },
        {
          question: "Why can't I search or copy text in a PDF from the library?",
          answer:
            "The document is a scanned image rather than text, so there are no characters to find. Running OCR adds an invisible text layer beneath the page image, after which search, copy and quotation all work normally.",
        },
        {
          question: "Are these tools really free for students?",
          answer:
            "Yes. There is no signup, no student email verification and no trial period. Files are processed in your browser rather than on a server, so there is no per-use hosting cost to recover. An optional Premium plan raises the file size limit but is not needed for typical coursework.",
        },
        {
          question: "Is it safe to use these for confidential university documents?",
          answer:
            "Your file is never uploaded. Processing happens locally in your browser, which you can verify by opening developer tools with F12 and watching the Network tab while you use a tool, or by disconnecting from the internet after the page loads and continuing to work.",
        },
        {
          question: "Can I use the AI PDF chat for my assignment?",
          answer:
            "Use it to navigate long documents and check your understanding, not to produce text you submit. Every institution's academic misconduct policy treats submitting AI-generated work as a serious offence, and the purpose of the reading is that you can discuss it yourself.",
        },
        {
          question: "How do I count words in a PDF for a word-limited essay?",
          answer:
            "Use a word counter on the PDF you are actually submitting rather than the source document. Counts can diverge once footnotes, captions and reference lists are rendered, and the submitted file is what gets marked.",
        },
      ]}
      closing={
        <>
          <p>
            The practical advantage for student work is that nothing waits on an upload. On congested
            campus wifi, compressing a 60&nbsp;MB dissertation locally finishes while a cloud tool is
            still receiving the file — which matters at 23:50 on a deadline.
          </p>
          <p>
            It also means a mitigating-circumstances form, a medical note or an unpublished
            dissertation is not sitting on a third party&apos;s server. Nothing you open here is
            transmitted anywhere.
          </p>
        </>
      }
    />
  );
}
