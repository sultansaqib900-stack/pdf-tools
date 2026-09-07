import type { Metadata } from "next";
import Link from "next/link";
import AudiencePage from "@/components/AudiencePage";

export const metadata: Metadata = {
  title: "PDF Tools for Teachers — Worksheets & Certificates",
  description: "Free PDF tools for teachers: build worksheets, merge student submissions, generate certificates and compress files. No uploads.",
  openGraph: {
    title: "Free PDF Tools for Teachers",
    description: "Create worksheets, merge submissions, generate certificates and compress files for email. Free, browser-based, no uploads.",
    url: "https://allaboutpdfediting.xyz/pdf-tools-for-teachers",
  },
};

export default function PDFToolsForTeachersPage() {
  return (
    <AudiencePage
      audience="For teachers"
      slug="pdf-tools-for-teachers"
      h1="PDF Tools for Teachers"
      intro={
        <>
          <p>
            Teaching generates a particular kind of document work: assembling worksheets from
            several sources, producing a class set of near-identical certificates, collecting
            submissions in every format imaginable, and sending files to parents through an email
            system with a small attachment limit.
          </p>
          <p>
            These tools are free and require no account, which matters because school devices are
            usually locked down and getting new software approved is slow. Nothing is installed and
            nothing is uploaded — relevant when the documents are student records covered by FERPA,
            GDPR or your local equivalent.
          </p>
        </>
      }
      workflows={[
        {
          title: "Building a worksheet or handout from several sources",
          body: (
            <>
              <p>
                Most handouts are assembled rather than authored: a page from a textbook scan, a
                diagram, a task sheet you wrote, an exam-board past paper.{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">Merge PDF</Link>{" "}
                brings them together in the order you choose, and{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>{" "}
                pulls the two relevant pages out of a fifty-page resource so students are not handed
                the whole thing.
              </p>
              <p>
                <Link href="/delete-pages" className="text-[var(--accent)] hover:underline">Delete pages</Link>{" "}
                removes the answer key before distribution — worth doing as a deliberate step, since
                sending the mark scheme with the paper is the classic mistake. Use{" "}
                <Link href="/crop" className="text-[var(--accent)] hover:underline">Crop</Link>{" "}
                to trim wide margins from a scan so the print is readable, and{" "}
                <Link href="/watermark" className="text-[var(--accent)] hover:underline">Watermark</Link>{" "}
                to mark a document DRAFT or SAMPLE so it is not mistaken for the live assessment.
              </p>
            </>
          ),
        },
        {
          title: "Producing a class set of certificates",
          body: (
            <>
              <p>
                Making thirty certificates by editing a name and exporting thirty times is an
                afternoon lost.{" "}
                <Link href="/certificate-generator" className="text-[var(--accent)] hover:underline">The certificate generator</Link>{" "}
                takes one template plus a list of names — a CSV exported from your register or
                spreadsheet — and produces the full set in one pass.
              </p>
              <p>
                It works for anything following the same pattern: award certificates, reading-scheme
                completion, sports day placings, end-of-year commendations. Because the names are
                processed locally, a class list containing real student names is not being uploaded
                to a third-party service, which is usually the blocker on tools like this in a school
                setting.
              </p>
            </>
          ),
        },
        {
          title: "Collecting and marking submissions",
          body: (
            <>
              <p>
                Students submit in whatever format they have. Convert with{" "}
                <Link href="/word-to-pdf" className="text-[var(--accent)] hover:underline">Word to PDF</Link>{" "}
                or{" "}
                <Link href="/image-to-pdf" className="text-[var(--accent)] hover:underline">Image to PDF</Link>{" "}
                for photographed handwritten work, then{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">merge</Link>{" "}
                a class set into a single file so you can mark in one sitting instead of opening
                thirty attachments.
              </p>
              <p>
                <Link href="/annotate" className="text-[var(--accent)] hover:underline">Annotate PDF</Link>{" "}
                handles feedback — highlight, comment, then return the marked copy. Phone photos of
                handwritten work often arrive rotated;{" "}
                <Link href="/rotate" className="text-[var(--accent)] hover:underline">Rotate</Link>{" "}
                fixes those in a couple of clicks, and{" "}
                <Link href="/organize" className="text-[var(--accent)] hover:underline">Organize pages</Link>{" "}
                reorders anything that arrived out of sequence.
              </p>
            </>
          ),
        },
        {
          title: "Email attachment limits and parent communication",
          body: (
            <>
              <p>
                School email systems commonly cap attachments at 10&nbsp;MB to 25&nbsp;MB, and a
                scanned report or a photo-heavy newsletter passes that quickly.{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>{" "}
                is the fix, and scanned documents shrink the most because their bulk is image data.
              </p>
              <p>
                When a document is going to an individual family rather than the whole class,{" "}
                <Link href="/protect" className="text-[var(--accent)] hover:underline">Protect PDF</Link>{" "}
                adds a password so a misdirected email does not expose a child&apos;s report. Send
                the password by a separate channel, not in the same message — a password in the
                covering email protects nothing.
              </p>
            </>
          ),
        },
        {
          title: "Student data and printing sensibly",
          body: (
            <>
              <p>
                Before a document leaves school, consider what is embedded in it.{" "}
                <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">The metadata sanitiser</Link>{" "}
                strips author names, file paths and revision timestamps that can carry more context
                than intended, and{" "}
                <Link href="/redact" className="text-[var(--accent)] hover:underline">Redact</Link>{" "}
                genuinely removes information rather than covering it — a black box drawn over a name
                still contains the name, which is a real and recurring data-protection incident.
              </p>
              <p>
                For the print room,{" "}
                <Link href="/booklet" className="text-[var(--accent)] hover:underline">the booklet creator</Link>{" "}
                imposes pages so a stapled booklet folds in the right order, and{" "}
                <Link href="/resize" className="text-[var(--accent)] hover:underline">Resize</Link>{" "}
                normalises a mix of A4 and Letter pages so the whole set prints consistently.
              </p>
            </>
          ),
        },
      ]}
      groups={[
        {
          heading: "Making teaching materials",
          tools: [
            { href: "/merge", label: "Merge PDF", desc: "Assemble a handout from several sources", icon: "merge" },
            { href: "/split", label: "Split PDF", desc: "Pull pages out of a large resource", icon: "split" },
            { href: "/delete-pages", label: "Delete pages", desc: "Remove the answer key before printing", icon: "delete" },
            { href: "/crop", label: "Crop PDF", desc: "Trim scan margins for readable print", icon: "crop" },
            { href: "/watermark", label: "Watermark", desc: "Mark a paper DRAFT or SAMPLE", icon: "droplet" },
            { href: "/booklet", label: "Booklet creator", desc: "Impose pages for stapled booklets", icon: "book" },
          ],
        },
        {
          heading: "Marking and admin",
          tools: [
            { href: "/certificate-generator", label: "Certificate generator", desc: "A class set from one template and a CSV", icon: "award" },
            { href: "/annotate", label: "Annotate PDF", desc: "Add feedback to student work", icon: "annotate" },
            { href: "/rotate", label: "Rotate PDF", desc: "Fix sideways photos of handwriting", icon: "rotate" },
            { href: "/organize", label: "Organize pages", desc: "Reorder pages that arrived jumbled", icon: "organize" },
            { href: "/compress", label: "Compress PDF", desc: "Fit reports under email limits", icon: "compress" },
            { href: "/fill-form", label: "Fill forms", desc: "Complete school admin forms", icon: "form" },
          ],
        },
        {
          heading: "Protecting student data",
          tools: [
            { href: "/protect", label: "Protect PDF", desc: "Password-protect an individual report", icon: "lock" },
            { href: "/redact", label: "Redact PDF", desc: "Remove names properly, not with a box", icon: "redact" },
            { href: "/metadata-sanitizer", label: "Clean metadata", desc: "Strip author and revision history", icon: "eraser" },
            { href: "/word-to-pdf", label: "Word to PDF", desc: "Lock formatting before sharing", icon: "fileText" },
            { href: "/image-to-pdf", label: "Image to PDF", desc: "Photographed work into a PDF", icon: "image" },
            { href: "/resize", label: "Resize PDF", desc: "Normalise A4 and Letter for printing", icon: "resize" },
          ],
        },
      ]}
      faqs={[
        {
          question: "How can I make 30 certificates without editing each one?",
          answer:
            "Use a certificate generator that merges a template with a list of names. Export your class list as a CSV, upload the template once, and the full set is produced in a single pass. Because processing is local, a list of real student names is never sent to a third-party service.",
        },
        {
          question: "Are these tools safe to use with student data under FERPA or GDPR?",
          answer:
            "Files are processed entirely in your browser and never uploaded, so student information is not transmitted to a third party or stored on any server. That removes the external data processor from the picture. Follow your school's own data protection policy as well.",
        },
        {
          question: "How do I email a large scanned report to parents?",
          answer:
            "Compress it first. School email systems commonly limit attachments to between 10MB and 25MB, and scanned documents shrink considerably because most of their size is image data. For an individual child's report, add a password and send it through a separate channel from the document.",
        },
        {
          question: "Can I use these on a locked-down school laptop?",
          answer:
            "Yes. There is nothing to install and no administrator rights are needed, because the tools run as a web page in Chrome, Firefox, Edge or Safari. This also avoids the software approval process that new desktop applications usually require.",
        },
        {
          question: "How do I remove the answer key before giving out a worksheet?",
          answer:
            "Use a delete-pages tool to remove those pages and save a separate student version, keeping the full document for yourself. Make it a deliberate step in your process, since distributing the mark scheme along with the paper is an easy mistake to make.",
        },
        {
          question: "Does covering a student's name with a black box hide it?",
          answer:
            "No. A drawn rectangle sits on top of the text and the name remains in the file, recoverable by copying the area or extracting text. Use a proper redaction tool that removes the underlying content, and clean the document metadata as well.",
        },
        {
          question: "How do I print a booklet so the pages fold in the right order?",
          answer:
            "Use a booklet tool to impose the pages before printing. It reorders and pairs pages so that when the stack is folded and stapled, the content reads in sequence, which manual duplex printing rarely achieves.",
        },
      ]}
      closing={
        <>
          <p>
            The reason this approach suits schools is not just cost. Student reports, safeguarding
            notes and class lists are exactly the documents that should not be casually uploaded to
            a free online converter, and most staff have no visibility into where those services
            store files.
          </p>
          <p>
            Local processing removes the question. You can verify it by opening developer tools with
            F12 and watching the Network tab while you use a tool, or simply by disconnecting from
            the network after the page loads and carrying on working.
          </p>
        </>
      }
    />
  );
}
