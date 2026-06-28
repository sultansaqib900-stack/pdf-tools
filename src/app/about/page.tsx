import AdBanner from "@/components/AdBanner";

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
            Make professional PDF editing free and private for everyone. <strong>29 tools</strong>,
            no signups, no uploads, no hidden costs. Everything runs in your browser and respects
            your privacy.
          </p>
          <AdBanner className="mb-8" />
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
          <li><strong>29 free PDF tools</strong> — Compress, merge, split, convert, edit, sign, protect, and more</li>
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
          {["Next.js", "TypeScript", "Tailwind CSS", "pdf-lib", "pdfjs-dist", "Gemini API", "WebAssembly", "Vercel", "Upstash Redis", "Lemon Squeezy", "Adsterra", "Buttondown"].map((tech) => (
            <span key={tech} className="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-xs font-medium text-[var(--foreground)]">
              {tech}
            </span>
          ))}
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
