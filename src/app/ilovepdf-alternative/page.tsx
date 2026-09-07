import type { Metadata } from "next";
import Link from "next/link";
import ComparisonPage from "@/components/ComparisonPage";

export const metadata: Metadata = {
  title: "iLovePDF Alternative — Free, Private PDF Editor",
  description: "A free iLovePDF alternative with no uploads, no signup and no file size ceiling on free tools. Compress, merge and split PDFs privately.",
  openGraph: {
    title: "iLovePDF Alternative — Free & Private",
    description: "Free alternative to iLovePDF. No uploads, no signup, no ads on tools. Everything runs in your browser.",
  },
};

export default function ILovePDFAltPage() {
  return (
    <ComparisonPage
      competitor="iLovePDF"
      slug="ilovepdf-alternative"
      pricingChecked="September 2026"
      h1="iLovePDF Alternative: The Same Tools, Without the Upload"
      intro={
        <>
          <p>
            iLovePDF is one of the most generous free PDF suites on the web. Unlike most competitors
            it does <em>not</em> cap how many tasks you run per day — the free tier is limited by{" "}
            <strong>per-tool file size ceilings</strong> and by holding batch processing, OCR and the
            desktop apps behind Premium. If you have read elsewhere that iLovePDF allows &ldquo;two
            files a day&rdquo;, that is inaccurate; it is Smallpdf that meters tasks.
          </p>
          <p>
            So the reason to switch is rarely the task count. It is that every file you process is
            uploaded to iLovePDF&apos;s servers, and that the free web experience is heavily
            ad-supported. PDFTools runs the same operations inside your browser, so your document is
            never transmitted and there is nothing to queue behind an upload.
          </p>
        </>
      }
      theirStrengths={[
        "No daily task cap on the free tier",
        "A very wide tool catalogue, over 25 tools",
        "Desktop and mobile apps on Premium",
        "A documented public API for developers",
        "Server-side OCR handles large scanned batches well",
        "Mature, well-localised interface in many languages",
      ]}
      ourStrengths={[
        "Files are never uploaded — processing is local",
        "No file size ceiling imposed by an upload pipeline",
        "No account or email address required",
        "No ads interleaved with the tools themselves",
        "Works with no connection once the page has loaded",
        "Batch processing without a Premium tier for most tasks",
      ]}
      rows={[
        { feature: "Where files are processed", them: "Uploaded to cloud servers", us: "In your browser only", advantage: true },
        { feature: "Free daily task cap", them: "None", us: "None" },
        { feature: "Free file size limit", them: "Per-tool ceilings", us: "10MB free / 100MB Premium" },
        { feature: "Account required", them: "For some features", us: "Never", advantage: true },
        { feature: "Ads on free tier", them: "Yes", us: "Yes, but not in the tool flow" },
        { feature: "Paid plan", them: "~$4–9/month", us: "Free, or $8–12/month optional" },
        { feature: "Batch processing", them: "Premium only", us: "Free for most tools", advantage: true },
        { feature: "Works offline", them: "Desktop app only (Premium)", us: "Yes, in the browser", advantage: true },
        { feature: "Public API", them: "Yes", us: "Premium only" },
        { feature: "Desktop & mobile apps", them: "Yes (Premium)", us: "Web only" },
        { feature: "OCR on scans", them: "Strong, server-side", us: "Good, browser-based" },
        { feature: "Chat with your PDF (AI)", them: "AI credits on Premium", us: "Yes, free" },
      ]}
      sections={[
        {
          heading: "Upload time is the hidden cost of a cloud PDF tool",
          body: (
            <>
              <p>
                The size limits on iLovePDF&apos;s free tier exist because every file has to travel to
                a server before anything happens. On a fast office connection that is invisible. On
                home broadband with slow upstream, or on mobile data, a 50&nbsp;MB scanned document can
                take longer to upload than the actual processing takes.
              </p>
              <p>
                Local processing inverts this. Your file is already on the machine doing the work, so
                the transfer time is zero regardless of size. The practical ceiling becomes your
                device&apos;s memory rather than a network round-trip, which is why{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">compressing</Link>{" "}
                a large scan often finishes locally before a cloud tool has finished receiving it.
              </p>
            </>
          ),
        },
        {
          heading: "Privacy is a structural difference, not a policy promise",
          body: (
            <>
              <p>
                iLovePDF has a reasonable privacy policy and deletes processed files after a period.
                That is a <em>promise</em>, backed by a company you have to trust. Browser-local
                processing is a <em>structure</em>: there is no server that could retain your file,
                because none ever received it.
              </p>
              <p>
                You can confirm this yourself in about ten seconds. Press F12, open the Network tab,
                and run any tool. Your document body never appears in a request. Disconnect your
                wifi after the page loads and the tools still work — which would be impossible if the
                processing happened remotely.
              </p>
              <p>
                For anyone handling client contracts, HR records, medical documents or anything under
                GDPR, this removes an entire compliance conversation. There is no data processor to
                assess, because there is no data processing off your machine.
              </p>
            </>
          ),
        },
        {
          heading: "Where iLovePDF still wins",
          body: (
            <>
              <p>
                <strong>The API.</strong> iLovePDF publishes a proper developer API for automating PDF
                work inside your own systems. If you need server-side automation, that is exactly the
                right tool and a browser-based one cannot substitute for it.
              </p>
              <p>
                <strong>Very large scanned batches.</strong> Running OCR across hundreds of pages is
                genuinely faster on dedicated server hardware than in a browser tab, and iLovePDF has
                built that pipeline well.
              </p>
              <p>
                <strong>Cross-device workflows.</strong> Premium includes desktop and mobile apps that
                sync. PDFTools is a website; it works on any device with a browser but it does not
                carry state between them, because it deliberately stores nothing.
              </p>
            </>
          ),
        },
        {
          heading: "A like-for-like tool map",
          body: (
            <>
              <p>
                Nearly every iLovePDF tool has a direct counterpart here:{" "}
                <Link href="/merge" className="text-[var(--accent)] hover:underline">Merge PDF</Link>,{" "}
                <Link href="/split" className="text-[var(--accent)] hover:underline">Split PDF</Link>,{" "}
                <Link href="/compress" className="text-[var(--accent)] hover:underline">Compress PDF</Link>,{" "}
                <Link href="/rotate" className="text-[var(--accent)] hover:underline">Rotate PDF</Link>,{" "}
                <Link href="/watermark" className="text-[var(--accent)] hover:underline">Watermark</Link>,{" "}
                <Link href="/unlock" className="text-[var(--accent)] hover:underline">Unlock PDF</Link>,{" "}
                <Link href="/protect" className="text-[var(--accent)] hover:underline">Protect PDF</Link>,{" "}
                <Link href="/organize" className="text-[var(--accent)] hover:underline">Organize pages</Link> and{" "}
                <Link href="/pdf-to-images" className="text-[var(--accent)] hover:underline">PDF to images</Link>.
              </p>
              <p>
                There are also a few tools iLovePDF does not offer, including{" "}
                <Link href="/pdf-diff" className="text-[var(--accent)] hover:underline">side-by-side PDF comparison</Link>,{" "}
                <Link href="/bates-numbering" className="text-[var(--accent)] hover:underline">Bates numbering</Link> for
                legal exhibits, and{" "}
                <Link href="/metadata-sanitizer" className="text-[var(--accent)] hover:underline">metadata sanitising</Link>{" "}
                to strip hidden author and GPS data before you share a file.
              </p>
            </>
          ),
        },
      ]}
      faqs={[
        {
          question: "Does iLovePDF have a daily task limit?",
          answer:
            "No. As of September 2026 iLovePDF's free tier is constrained by per-tool file size ceilings rather than a task count, so you can run many tasks per day within those size limits. Batch processing, OCR and the desktop and mobile apps require Premium.",
        },
        {
          question: "What is the best free iLovePDF alternative?",
          answer:
            "PDFTools offers the same core operations — merge, split, compress, convert, rotate, watermark, protect and unlock — with no account and no upload. Files are processed locally in your browser, so documents are never transmitted to a server.",
        },
        {
          question: "Does iLovePDF upload my files?",
          answer:
            "Yes. iLovePDF is a cloud service, so files are uploaded to its servers, processed there and deleted after a retention period. PDFTools processes files entirely in your browser, so nothing is uploaded at any point.",
        },
        {
          question: "How much does iLovePDF Premium cost?",
          answer:
            "Roughly $4 to $9 per month depending on billing cycle and region, with annual billing cheaper than monthly, as of September 2026. Premium removes size limits and ads and unlocks batch processing plus the desktop and mobile apps.",
        },
        {
          question: "Can I process large PDFs without a size limit?",
          answer:
            "Local processing has no upload ceiling, so the practical limit is your device's available memory rather than a network transfer. The PDFTools free tier applies a 10MB guideline and Premium raises this to 100MB, but large files never need to be uploaded first.",
        },
        {
          question: "Is there an API like iLovePDF's?",
          answer:
            "iLovePDF offers a public developer API and it is the better choice for server-side automation. PDFTools includes API access with Premium, but its core design is browser-local processing rather than programmatic server integration.",
        },
        {
          question: "Do PDFTools tools work without an internet connection?",
          answer:
            "Yes. Once a tool page has loaded, the processing engine runs locally, so you can disconnect and continue working. This is only possible because your file is never sent anywhere for processing.",
        },
      ]}
      tools={[
        { href: "/merge", label: "Merge PDF", icon: "merge" },
        { href: "/split", label: "Split PDF", icon: "split" },
        { href: "/compress", label: "Compress PDF", icon: "compress" },
        { href: "/watermark", label: "Watermark PDF", icon: "droplet" },
        { href: "/protect", label: "Protect PDF", icon: "lock" },
        { href: "/pdf-diff", label: "Compare two PDFs", icon: "diff" },
      ]}
      verdict={
        <>
          <p>
            iLovePDF is a strong free suite and the absence of a daily task cap makes it more usable
            than most. If you need a documented API or heavy server-side OCR, stay with it.
          </p>
          <p>
            Switch if the uploading itself is the problem — because the documents are confidential,
            because your connection makes large uploads painful, or because you would rather not
            create an account and work around ads. Those are exactly the constraints browser-local
            processing removes.
          </p>
        </>
      }
    />
  );
}
