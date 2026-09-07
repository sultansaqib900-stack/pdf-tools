import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6">About PDFTools</h1>

      <div className="text-sm text-[var(--muted)] space-y-5 leading-relaxed">
        <p>
          PDFTools was built by <strong>Saqib</strong>, an independent developer from Pakistan.
          I built this because I needed reliable PDF tools that worked without uploading sensitive
          documents to some server. Every tool processes files <strong>100% client-side</strong> —
          your data never leaves your device.
        </p>

        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
          <p className="font-semibold text-[var(--foreground)] mb-2">The Mission</p>
          <p>
            Make professional PDF editing free and private for everyone. <strong>more than sixty tools</strong>,
            no signups, no uploads, no hidden costs. Everything runs in your browser and respects
            your privacy.
          </p>
    </div>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">Why I Built This</h2>
        <p>
          Every other PDF site either uploads your files to a server (privacy risk) or charges
          a subscription for basic features. I wanted to prove you could have both: <strong>free
          tools</strong> that are <strong>genuinely private</strong>. All processing uses pdf-lib
          and pdfjs-dist — the same libraries powering desktop apps — running right in your
          browser tab via WebAssembly.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">What We Offer</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li><strong>Over sixty free PDF tools</strong> — Compress, merge, split, convert, edit, sign, protect, and more</li>
          <li><strong>AI Chat with PDF</strong> — Upload any PDF and ask AI questions about its content</li>
          <li><strong>AI OCR</strong> — Extract text from scanned/image-based PDFs using AI vision</li>
          <li><strong>Premium subscription</strong> — Unlimited usage, no ads, larger files, batch processing</li>
          <li><strong>Real user feedback</strong> — See what others say about our tools on the homepage</li>
        </ul>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>You pick a file from your device</li>
          <li>pdf-lib or pdfjs-dist reads and processes it in your browser</li>
          <li>You download the result. Nothing was ever uploaded.</li>
        </ol>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">Tech Stack</h2>
        <p className="flex flex-wrap gap-2">
          {["Next.js", "TypeScript", "Tailwind CSS", "pdf-lib", "pdfjs-dist", "Gemini API", "WebAssembly", "Vercel", "Upstash Redis", "Lemon Squeezy", "Buttondown"].map((tech) => (
            <span key={tech} className="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">
              {tech}
            </span>
          ))}
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">What &ldquo;client-side&rdquo; means, and how to verify it</h2>
        <p>
          Plenty of sites claim to respect your privacy. This one makes a claim you can check
          yourself in about ten seconds. Open any tool, press F12 to open your browser&apos;s
          developer tools, select the Network tab, and process a document while watching. You will
          see no request carrying your file, because there is nowhere for it to go.
        </p>
        <p>
          A stronger version of the same test: load a tool page, disconnect from the internet, then
          use it. It keeps working, because the code that processes your document is already running
          on your machine. No cloud service can do that.
        </p>
        <p>
          The honest caveat is that the site itself is a normal website. It serves analytics and
          advertising, which is how free tools stay free, and those scripts see the usual things any
          site sees — that a page was visited, from roughly where, in which browser. What they never
          see is your documents, because your documents never travel. Two features are deliberate
          exceptions and are labelled as such:{" "}
          <Link href="/chat-pdf" className="text-[var(--accent)] hover:underline">Chat with PDF</Link>{" "}
          and AI-assisted{" "}
          <Link href="/ocr-pdf" className="text-[var(--accent)] hover:underline">OCR</Link>{" "}
          send text to an AI service, because that work genuinely cannot happen locally. Everything
          else does.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">Why this matters more than it sounds</h2>
        <p>
          The documents people put through PDF tools are rarely trivial. They are contracts, medical
          letters, bank statements, passport scans, case files, student records, tax returns. Uploading
          one to a free web service means handing a copy to a company you know nothing about, trusting
          a retention policy you have not read, and accepting a breach risk you cannot assess.
        </p>
        <p>
          For some people that is not merely uncomfortable but prohibited. A solicitor handling client
          files is bound by confidentiality duties that make casual uploads a professional problem. A
          teacher handling student data is bound by rules such as FERPA and GDPR. A clinician handling
          patient records has stricter obligations still. Processing locally removes the question
          entirely: there is no transfer, so there is nothing to disclose, log or justify.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">What this site is not good at</h2>
        <p>
          Being honest about the limits is more useful than pretending there are none. Because
          everything runs on your machine, very large documents are constrained by your available
          memory rather than by a server farm — a several-hundred-megabyte file may struggle on a
          modest laptop where a cloud service would cope.
        </p>
        <p>
          There is no account syncing documents between your devices, because nothing is stored
          anywhere to sync. Conversions to and from Office formats are good but not perfect, and
          heavily designed layouts will need tidying afterwards. And if you have forgotten a PDF
          password, no tool here will recover it — that is a property of the encryption, not a
          missing feature.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">How it is funded</h2>
        <p>
          The free tools are supported by advertising, and an optional{" "}
          <Link href="/premium" className="text-[var(--accent)] hover:underline">premium subscription</Link>{" "}
          removes the ads, lifts usage limits and unlocks specialised tools such as Bates numbering,
          document comparison and bulk certificate generation. The subscription funds the work; it does
          not change how your files are handled, because free and paid tools both run in your browser.
        </p>

        <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">Contact</h2>
        <p>
          Have feedback or suggestions? Email me at <strong>saqibbostan83@gmail.com</strong>.
          I read every message. You can also leave public feedback on the homepage.
        </p>
      </div>
    </div>
  );
}
