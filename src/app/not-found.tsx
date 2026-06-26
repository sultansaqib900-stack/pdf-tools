import Link from "next/link";

const tools = [
  { name: "Compress PDF", href: "/compress" },
  { name: "Merge PDF", href: "/merge" },
  { name: "Split PDF", href: "/split" },
  { name: "Sign PDF", href: "/sign" },
  { name: "Protect PDF", href: "/protect" },
  { name: "Unlock PDF", href: "/unlock" },
  { name: "Image to PDF", href: "/image-to-pdf" },
  { name: "PDF to Images", href: "/pdf-to-images" },
  { name: "Rotate PDF", href: "/rotate" },
  { name: "Organize Pages", href: "/organize" },
  { name: "Extract Text", href: "/extract-text" },
  { name: "Chat with PDF", href: "/chat-pdf" },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-8xl font-bold text-indigo-600/20 dark:text-indigo-400/10 mb-4">404</div>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">Page Not Found</h1>
      <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition"
        >
          Homepage
        </Link>
        <Link
          href="/tools"
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition"
        >
          All Tools
        </Link>
        <Link
          href="/blog"
          className="px-6 py-2.5 border border-[var(--card-border)] text-[var(--foreground)] font-medium rounded-xl text-sm hover:bg-[var(--card)] transition"
        >
          Browse Blog
        </Link>
      </div>
      <div className="mt-10 pt-8 border-t border-[var(--card-border)]">
        <p className="text-xs text-[var(--muted)] mb-3">Popular tools you might need:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-lg mx-auto">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="px-3 py-2 rounded-lg border border-[var(--card-border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-indigo-500/30 hover:bg-[var(--card)] transition"
            >
              {tool.name}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/tools" className="text-xs text-indigo-500 hover:underline">
            View all 29 tools &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
