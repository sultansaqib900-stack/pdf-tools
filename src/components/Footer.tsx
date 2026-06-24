export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Tools</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/compress" className="block hover:text-[var(--foreground)]">Compress PDF</a>
              <a href="/merge" className="block hover:text-[var(--foreground)]">Merge PDF</a>
              <a href="/split" className="block hover:text-[var(--foreground)]">Split PDF</a>
              <a href="/image-to-pdf" className="block hover:text-[var(--foreground)]">Image to PDF</a>
              <a href="/extract-text" className="block hover:text-[var(--foreground)]">Extract Text</a>
              <a href="/add-page-numbers" className="block hover:text-[var(--foreground)]">Page Numbers</a>
              <a href="/rotate" className="block hover:text-[var(--foreground)]">Rotate PDF</a>
              <a href="/protect" className="block hover:text-[var(--foreground)]">Protect PDF</a>
              <a href="/unlock" className="block hover:text-[var(--foreground)]">Unlock PDF</a>
              <a href="/delete-pages" className="block hover:text-[var(--foreground)]">Delete Pages</a>
              <a href="/organize" className="block hover:text-[var(--foreground)]">Organize Pages</a>
              <a href="/resize" className="block hover:text-[var(--foreground)]">Resize PDF</a>
              <a href="/crop" className="block hover:text-[var(--foreground)]">Crop PDF</a>
              <a href="/watermark" className="block hover:text-[var(--foreground)]">Watermark PDF</a>
              <a href="/sign" className="block hover:text-[var(--foreground)]">Sign PDF</a>
              <a href="/chat-pdf" className="block hover:text-[var(--foreground)]">Chat with PDF</a>
              <a href="/html-to-pdf" className="block hover:text-[var(--foreground)]">HTML to PDF</a>
              <a href="/fill-form" className="block hover:text-[var(--foreground)]">Fill PDF Form</a>
              <a href="/flatten-pdf" className="block hover:text-[var(--foreground)]">Flatten PDF</a>
              <a href="/reverse-pdf" className="block hover:text-[var(--foreground)]">Reverse PDF Order</a>
              <a href="/batch" className="block hover:text-[var(--foreground)]">Batch Process</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Company</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/about" className="block hover:text-[var(--foreground)]">About</a>
              <a href="/blog" className="block hover:text-[var(--foreground)]">Blog</a>
              <a href="mailto:saqibbostan83@gmail.com" className="block hover:text-[var(--foreground)]">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Legal</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/privacy" className="block hover:text-[var(--foreground)]">Privacy</a>
              <a href="/terms" className="block hover:text-[var(--foreground)]">Terms</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-[var(--foreground)]">Monetize</h4>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <a href="/premium" className="block hover:text-[var(--foreground)]">Go Premium</a>
              <a href="mailto:saqibbostan83@gmail.com?subject=Advertising" className="block hover:text-[var(--foreground)]">Advertise</a>
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
