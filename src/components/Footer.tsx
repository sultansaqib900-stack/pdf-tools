export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Tools</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              {[
                ["Compress PDF", "/compress"], ["Merge PDF", "/merge"], ["Split PDF", "/split"],
                ["Image to PDF", "/image-to-pdf"], ["Extract Text", "/extract-text"],
                ["Page Numbers", "/add-page-numbers"], ["Rotate PDF", "/rotate"],
                ["Protect PDF", "/protect"], ["Unlock PDF", "/unlock"],
                ["Delete Pages", "/delete-pages"], ["Organize Pages", "/organize"],
                ["Resize PDF", "/resize"], ["Crop PDF", "/crop"],
                ["Watermark PDF", "/watermark"], ["Sign PDF", "/sign"],
                ["Chat with PDF", "/chat-pdf"], ["HTML to PDF", "/html-to-pdf"],
                ["Fill PDF Form", "/fill-form"], ["Flatten PDF", "/flatten-pdf"],
                ["Reverse PDF Order", "/reverse-pdf"], ["Batch Process", "/batch"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Company</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/about" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">About</a>
              <a href="/blog" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Blog</a>
              <a href="mailto:saqibbostan83@gmail.com" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Legal</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/privacy" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Privacy</a>
              <a href="/terms" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Terms</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Monetize</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/premium" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Go Premium</a>
              <a href="mailto:saqibbostan83@gmail.com?subject=Advertising" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Advertise</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--card-border)] pt-6 text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} PDFTools. All tools process locally in your browser.
        </div>
      </div>
    </footer>
  );
}
