import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Core Tools */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-indigo-400">Core Tools</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/studio" className="block text-indigo-400 font-bold hover:underline">⚡ PDF Studio Pipeline</Link>
              <Link href="/recipes" className="block text-purple-400 font-bold hover:underline">⚡ PDF Recipes (Macros)</Link>
              <Link href="/pii-guardian" className="block text-red-400 font-bold hover:underline">🛡️ PII Guardian</Link>
              <Link href="/compress" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Compress PDF</Link>
              <Link href="/merge" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Merge PDF</Link>
              <Link href="/split" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Split PDF</Link>
              <Link href="/image-to-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Image to PDF</Link>
              <Link href="/pdf-to-images" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">PDF to Images</Link>
              <Link href="/pdf-to-word" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">PDF to Word</Link>
              <Link href="/word-to-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Word to PDF</Link>
              <Link href="/pdf-to-excel" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">PDF to Excel</Link>
              <Link href="/ocr-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">OCR PDF</Link>
            </div>
          </div>

          {/* Col 2: Edit & Security */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-purple-400">Edit & Security</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/edit-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Edit PDF</Link>
              <Link href="/sign" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">e-Sign PDF</Link>
              <Link href="/protect" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Protect PDF</Link>
              <Link href="/unlock" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Unlock PDF</Link>
              <Link href="/watermark" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Watermark PDF</Link>
              <Link href="/redact" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Redact PDF</Link>
              <Link href="/delete-pages" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Delete Pages</Link>
              <Link href="/organize" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Organize Pages</Link>
              <Link href="/rotate" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Rotate PDF</Link>
              <Link href="/crop" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Crop PDF</Link>
            </div>
          </div>

          {/* Col 3: Premium Suite */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-amber-500">⭐ Premium Suite</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/pdf-diff" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">PDF Diff Compare</Link>
              <Link href="/bates-numbering" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Bates Numbering</Link>
              <Link href="/certificate-generator" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Certificate Generator</Link>
              <Link href="/pdf-to-audio" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">PDF to Audio (TTS)</Link>
              <Link href="/form-data-extract" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Form Data to CSV</Link>
              <Link href="/bulk-rename" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Bulk Rename</Link>
              <Link href="/booklet" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Booklet Creator</Link>
              <Link href="/search-redact" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Search & Redact</Link>
              <Link href="/vault" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Encrypted Vault</Link>
              <Link href="/split-by-bookmarks" className="block hover:text-amber-400 hover:translate-x-0.5 transition-all">Split by Bookmarks</Link>
            </div>
          </div>

          {/* Col 4: Solutions & Guides */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-emerald-400">Workflows & SEO</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/pdf-tools-for-students" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">For Students</Link>
              <Link href="/pdf-tools-for-lawyers" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">For Lawyers</Link>
              <Link href="/pdf-tools-for-teachers" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">For Teachers</Link>
              <Link href="/pdf-tools-for-business" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">For Business</Link>
              <Link href="/blog" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">All 45+ Blog Guides</Link>
              <Link href="/ultimate-guide-to-pdf-editing" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Ultimate PDF Guide</Link>
              <Link href="/adobe-acrobat-alternative" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Acrobat Alternative</Link>
              <Link href="/ilovepdf-alternative" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">iLovePDF Alternative</Link>
              <Link href="/es" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">🇪🇸 Español (Inicio)</Link>
              <Link href="/es/tools" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">🇪🇸 Herramientas PDF</Link>
            </div>
          </div>

          {/* Col 5: Company & Legal */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-[var(--foreground)]">Company</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/premium" className="block font-bold text-amber-500 hover:underline">⭐ Upgrade to Premium</Link>
              <Link href="/about" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">About Us</Link>
              <Link href="/contact" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Contact Support</Link>
              <Link href="/qa" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Q&A Knowledgebase</Link>
              <Link href="/privacy" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Terms of Service</Link>
              <Link href="/sitemap" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">HTML Sitemap</Link>
              <Link href="/embed" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">Embeddable Widget</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--card-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>100% Client-Side Privacy: No files ever uploaded to any server.</span>
          </div>
          <p>&copy; {new Date().getFullYear()} PDFTools (allaboutpdfediting.xyz). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
