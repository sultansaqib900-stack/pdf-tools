import type { Metadata } from "next";
import Link from "next/link";
import ComparisonPage from "@/components/ComparisonPage";

export const metadata: Metadata = {
  title: "SmallPDF Alternative — Free, Private PDF Editor",
  description: "A free SmallPDF alternative with no uploads, no signup and no daily task cap. Compress, merge, split and edit PDFs in your browser.",
  openGraph: {
    title: "SmallPDF Alternative — Free & Private",
    description: "Free alternative to SmallPDF. No uploads, no signup, no daily task cap. Everything runs in your browser.",
  },
};

export default function SmallPDFAltPage() {
  return (
    <ComparisonPage
      competitor="Smallpdf"
      slug="smallpdf-alternative"
      pricingChecked="September 2026"
      h1="Smallpdf Alternative: Free, Private PDF Tools With No Daily Cap"
      intro={
        <>
          <p>
            Smallpdf is a genuinely good product. It is Swiss-built, it has served over a billion
            documents, and its compression quality is among the best on the web. Most people who go
            looking for an alternative are not unhappy with the tools — they have hit the{" "}
            <strong>two-tasks-per-day ceiling</strong> on the free plan, or they have realised their
            documents are being uploaded to someone else&apos;s servers.
          </p>
          <p>
            PDFTools takes a different architectural approach. Every tool runs inside your browser
            using WebAssembly and <code className="text-[0.8125rem]">pdf-lib</code>, so your file is
            never transmitted anywhere. That single decision is what removes the daily cap, the
            signup wall, and the privacy question all at once. This page explains the trade-off
            honestly, including the places where Smallpdf is still the better choice.
          </p>
        </>
      }
      theirStrengths={[
        "Desktop and mobile apps, plus a Chrome extension",
        "Integrations with Google Drive, Dropbox and Microsoft 365",
        "Best-in-class OCR on scanned documents",
        "True text editing inside an existing PDF (Pro)",
        "eSignatures with an audit trail, valid in 180+ countries",
        "A polished, heavily user-tested interface",
      ]}
      ourStrengths={[
        "Files never leave your device — no server ever receives them",
        "No daily task cap on the free tier",
        "No account, no email, no password required",
        "No watermarks on output, ever",
        "Works offline once the page has loaded",
        "Free tools stay free; Premium is optional",
      ]}
      rows={[
        { feature: "Where files are processed", them: "Uploaded to cloud servers", us: "In your browser only", advantage: true },
        { feature: "Free daily task limit", them: "2 tasks per day", us: "No task cap", advantage: true },
        { feature: "Account required", them: "Yes, beyond the free cap", us: "Never", advantage: true },
        { feature: "Watermarks on free output", them: "On some tools", us: "None", advantage: true },
        { feature: "Paid plan", them: "~$9–15/month", us: "Free, or $8–12/month optional" },
        { feature: "File retention", them: "Deleted after ~1 hour", us: "Nothing is ever received", advantage: true },
        { feature: "Works offline", them: "Desktop app only (Pro)", us: "Yes, in the browser", advantage: true },
        { feature: "OCR on scans", them: "Excellent (Pro)", us: "Good, browser-based" },
        { feature: "Editing existing PDF text", them: "Yes (Pro)", us: "Annotations and overlays" },
        { feature: "Desktop & mobile apps", them: "Yes", us: "Web only" },
        { feature: "Cloud storage integrations", them: "Drive, Dropbox, M365", us: "None" },
        { feature: "Chat with your PDF (AI)", them: "Yes (AI Assistant)", us: "Yes, free" },
      ]}
      sections={[
        {
          heading: "The daily limit is the reason most people leave",
          body: (
            <>
              <p>
                Smallpdf&apos;s free tier allows two tasks per day. That sounds generous until you
                realise a single real job usually costs several tasks. Splitting a scanned contract,
                compressing the result and merging it with a cover letter is three tasks — you are
                blocked partway through your second document of the day.
              </p>
              <p>
                Because PDFTools does the work on your own CPU rather than a rented server, there is
                no per-task cost to meter. The free tier applies a daily allowance to the heaviest
                operations to keep the service sustainable, but ordinary tasks like{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">merging</Link>,{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">splitting</Link>{" "}
                and{" "}
                <Link href="/rotate" className="text-[var(--accent)] hover:underline">rotating</Link>{" "}
                are not rationed the way a cloud service must ration them.
              </p>
            </>
          ),
        },
        {
          heading: "What &ldquo;no upload&rdquo; actually means in practice",
          body: (
            <>
              <p>
                This claim gets made loosely, so here is how to verify it. Open any PDFTools page,
                press F12 to open your browser&apos;s developer tools, and switch to the Network tab.
                Now process a file. You will see the page assets load, and then nothing — no request
                carrying your document body. You can also disconnect from the internet entirely after
                the page loads and the tools keep working.
              </p>
              <p>
                Smallpdf is transparent that it uploads: files go to its servers, are processed there,
                and are deleted after roughly an hour. For most documents that is a perfectly
                reasonable trade. For a signed contract, a medical record, a tax return or an
                unreleased financial statement, &ldquo;deleted after an hour&rdquo; is a very different
                guarantee from &ldquo;never transmitted&rdquo;.
              </p>
              <p>
                If your employer has a data-handling policy, this distinction often decides whether a
                tool is usable at all. Browser-local processing means no third-party data processor
                agreement is needed, because there is no third-party processing.
              </p>
            </>
          ),
        },
        {
          heading: "When you should stay with Smallpdf",
          body: (
            <>
              <p>
                Three cases, and they are real. First, <strong>heavy OCR work</strong>: recognising
                text in large volumes of low-quality scans is computationally expensive and Smallpdf&apos;s
                server-side engine is better at it than anything that fits in a browser tab.
              </p>
              <p>
                Second, <strong>editing existing text inside a PDF</strong>. PDFTools lets you overlay
                text, annotate and fill forms, but reflowing an existing paragraph in the original font
                is a Pro feature in Smallpdf and it works well.
              </p>
              <p>
                Third, <strong>deep workflow integration</strong>. If your team lives in Google Drive
                or Microsoft 365 and wants PDFs to round-trip without downloading, a cloud service is
                simply the right architecture. Being browser-local is a privacy advantage and an
                integration limitation at the same time — that is the honest trade.
              </p>
            </>
          ),
        },
        {
          heading: "Migrating: the tools map almost one to one",
          body: (
            <>
              <p>
                There is nothing to export or import, since neither tool stores your files. Everything
                you were doing on Smallpdf has a direct equivalent:{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>,{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">Merge PDF</Link>,{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>,{" "}
                <Link href="/pdf-to-word" className="text-[var(--accent)] hover:underline">PDF to Word</Link>,{" "}
                <Link href="/image-to-pdf" className="text-[var(--accent)] hover:underline">Image to PDF</Link>,{" "}
                <Link href="/sign" className="text-[var(--accent)] hover:underline">Sign PDF</Link> and{" "}
                <Link href="/unlock" className="text-[var(--accent)] hover:underline">Unlock PDF</Link>.
              </p>
              <p>
                A practical tip: the first time you run a tool the WebAssembly engine downloads, which
                takes a second or two. After that it is cached, and processing is typically faster than
                a cloud round-trip because there is no upload or download of your document at all.
                Large files benefit the most — a 40&nbsp;MB scan that would take a minute to upload on
                a slow connection starts processing instantly.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          question: "Is there a completely free alternative to Smallpdf?",
          answer:
            "Yes. PDFTools provides compression, merging, splitting, conversion, signing and form filling free with no daily task cap and no account. Because processing happens in your browser rather than on a server, there is no per-task infrastructure cost to recover, so the free tier is not restricted to two tasks per day.",
        },
        {
          question: "How many free tasks does Smallpdf allow per day?",
          answer:
            "Smallpdf limits free users to two tasks per day across its tool suite, after which you wait 24 hours or subscribe to Pro. Pro pricing is roughly $9 to $15 per month depending on billing cycle and plan, as of September 2026.",
        },
        {
          question: "Does Smallpdf upload my files to its servers?",
          answer:
            "Yes. Smallpdf processes documents in the cloud, so your file is transmitted over the internet and stored temporarily, typically deleted after about an hour. PDFTools processes files locally in your browser, so your document is never transmitted at all.",
        },
        {
          question: "Can I verify that PDFTools does not upload my file?",
          answer:
            "Yes, and you should. Open your browser's developer tools with F12, select the Network tab, then process a document. No request containing your file body will appear. You can also disconnect from the internet after the page has loaded and the tools will continue to work normally.",
        },
        {
          question: "Does PDFTools add a watermark to free output?",
          answer:
            "No. There are no watermarks on any output at any tier. Smallpdf may add branding or watermarks to certain free-tier outputs, most notably when editing.",
        },
        {
          question: "Is Smallpdf better than PDFTools for anything?",
          answer:
            "Yes, in three areas: OCR quality on large volumes of poor-quality scans, true text editing inside an existing PDF, and integrations with Google Drive, Dropbox and Microsoft 365. It also offers desktop and mobile apps, whereas PDFTools is web only.",
        },
        {
          question: "Do I need to create an account to use PDFTools?",
          answer:
            "No. There is no signup, no email address and no password. Open a tool and use it immediately. An optional Premium plan raises the file size limit to 100MB and enables batch processing, but the free tools require no account.",
        },
      ]}
      tools={[
        { href: "/compress", label: "Compress PDF", icon: "compress" },
        { href: "/merge", label: "Merge PDF", icon: "merge" },
        { href: "/split", label: "Split PDF", icon: "split" },
        { href: "/pdf-to-word", label: "PDF to Word", icon: "fileWord" },
        { href: "/sign", label: "Sign PDF", icon: "signature" },
        { href: "/chat-pdf", label: "Chat with PDF", icon: "sparkles" },
      ]}
      verdict={
        <>
          <p>
            If you use PDF tools a few times a month and value polish and integrations, Smallpdf&apos;s
            free tier is fine and Pro is fairly priced for what it does.
          </p>
          <p>
            If you hit the two-task ceiling, object to paying roughly $100 a year for occasional
            document chores, or handle documents that should not be uploaded to a third party, then a
            browser-local tool is not a compromise — it is a better fit for the job. You give up
            cloud integrations and server-grade OCR, and you get privacy, no caps and no account.
          </p>
        </>
      }
    />
  );
}
