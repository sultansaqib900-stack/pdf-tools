"use client";

// Client component: the footer is shared by both locales and reads the
// current pathname to render `/es` routes in Spanish. Next.js still
// pre-renders this component to static HTML, so every footer link stays
// crawlable in the server response.

import Link from "next/link";
import { usePathname } from "next/navigation";
import PremiumStateCta from "@/components/PremiumStateCta";
import { CORE_TOOL_COUNT, FOOTER_PRIVACY_LINE, PROFESSIONAL_TOOL_COUNT } from "@/lib/site";
import { pathLocale } from "@/lib/i18n";
import { ES_FOOTER_COPY, ES_FOOTER_HEADINGS, esFooterLabel } from "@/lib/es-nav";

export default function Footer() {
  // The footer is shared by both locales; `/es` routes get fully translated
  // headings, link labels and trust copy instead of mixed English/Spanish.
  const pathname = usePathname() || "/";
  const isEs = pathLocale(pathname) === "es";
  const t = (href: string, fallback: string) => (isEs ? esFooterLabel(href, fallback) : fallback);
  const heading = (key: keyof typeof ES_FOOTER_HEADINGS, fallback: string) =>
    isEs ? ES_FOOTER_HEADINGS[key] : fallback;

  return (
    <footer className="w-full border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Core Tools */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-indigo-600">{heading("coreTools", "Core Tools")}</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/recipes" className="block text-purple-600 font-bold hover:underline">{t("/recipes", "⚡ PDF Recipes (Macros)")}</Link>
              <Link href="/pii-guardian" className="block text-red-600 font-bold hover:underline">{t("/pii-guardian", "🛡️ PII Guardian")}</Link>
              <Link href="/compress" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/compress", "Compress PDF")}</Link>
              <Link href="/merge" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/merge", "Merge PDF")}</Link>
              <Link href="/split" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/split", "Split PDF")}</Link>
              <Link href="/image-to-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/image-to-pdf", "Image to PDF")}</Link>
              <Link href="/pdf-to-images" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-to-images", "PDF to Images")}</Link>
              <Link href="/pdf-to-word" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-to-word", "PDF to Word")}</Link>
              <Link href="/word-to-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/word-to-pdf", "Word to PDF")}</Link>
              <Link href="/pdf-to-excel" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-to-excel", "PDF to Excel")}</Link>
              <Link href="/ocr-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/ocr-pdf", "OCR PDF")}</Link>
            </div>
          </div>

          {/* Col 2: Edit & Security */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-purple-600">{heading("editSecurity", "Edit & Security")}</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/edit-pdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/edit-pdf", "Edit PDF")}</Link>
              <Link href="/sign" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/sign", "e-Sign PDF")}</Link>
              <Link href="/protect" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/protect", "Protect PDF")}</Link>
              <Link href="/unlock" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/unlock", "Unlock PDF")}</Link>
              <Link href="/watermark" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/watermark", "Watermark PDF")}</Link>
              <Link href="/redact" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/redact", "Redact PDF")}</Link>
              <Link href="/delete-pages" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/delete-pages", "Delete Pages")}</Link>
              <Link href="/organize" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/organize", "Organize Pages")}</Link>
              <Link href="/rotate" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/rotate", "Rotate PDF")}</Link>
              <Link href="/crop" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/crop", "Crop PDF")}</Link>
            </div>
          </div>

          {/* Col 3: Premium Suite */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-amber-500">{heading("premium", "⭐ Premium Suite")}</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/studio" className="block text-indigo-600 font-bold hover:underline">{t("/studio", "⚡ PDF Studio Pipeline")}</Link>
              <Link href="/pdf-diff" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/pdf-diff", "PDF Diff Compare")}</Link>
              <Link href="/bates-numbering" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/bates-numbering", "Bates Numbering")}</Link>
              <Link href="/certificate-generator" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/certificate-generator", "Certificate Generator")}</Link>
              <Link href="/pdf-to-audio" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/pdf-to-audio", "PDF to Audio (TTS)")}</Link>
              <Link href="/form-data-extract" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/form-data-extract", "Form Data to CSV")}</Link>
              <Link href="/bulk-rename" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/bulk-rename", "Bulk Rename")}</Link>
              <Link href="/booklet" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/booklet", "Booklet Creator")}</Link>
              <Link href="/search-redact" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/search-redact", "Search & Redact")}</Link>
              <Link href="/vault" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all" rel="nofollow">Encrypted Vault</Link>
              <Link href="/split-by-bookmarks" className="block hover:text-amber-700 hover:translate-x-0.5 transition-all">{t("/split-by-bookmarks", "Split by Bookmarks")}</Link>
            </div>
          </div>

          {/* Col 4: Solutions & Guides */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-emerald-600">{heading("workflows", "Workflows & SEO")}</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <Link href="/pdf-tools-for-students" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-tools-for-students", "For Students")}</Link>
              <Link href="/pdf-tools-for-lawyers" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-tools-for-lawyers", "For Lawyers")}</Link>
              <Link href="/pdf-tools-for-teachers" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-tools-for-teachers", "For Teachers")}</Link>
              <Link href="/pdf-tools-for-business" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/pdf-tools-for-business", "For Business")}</Link>
              <Link href="/blog" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/blog", "All 52 Tool Guides & Blog Posts")}</Link>
              <Link href="/ultimate-guide-to-pdf-editing" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/ultimate-guide-to-pdf-editing", "Ultimate PDF Guide")}</Link>
              <Link href="/vs/adobe-acrobat" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/vs/adobe-acrobat", "⚔️ vs Adobe Acrobat Pro")}</Link>
              <Link href="/vs/ilovepdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/vs/ilovepdf", "⚔️ vs iLovePDF")}</Link>
              <Link href="/vs/smallpdf" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/vs/smallpdf", "⚔️ vs SmallPDF")}</Link>
              <Link href="/es" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/es", "🇪🇸 Español (Inicio)")}</Link>
              <Link href="/es/tools" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/es/tools", "🇪🇸 Herramientas PDF")}</Link>
            </div>
          </div>

          {/* Col 5: Company & Legal */}
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider mb-4 text-[var(--foreground)]">{heading("company", "Company")}</h4>
            <div className="space-y-2 text-xs text-[var(--muted)] font-medium">
              <PremiumStateCta
                upgradeLabel="⭐ Upgrade to Premium"
                upgradeHref="/premium"
                className="block font-bold text-amber-500 hover:underline"
                activeLabel="✓ Premium Active"
                activeHref="/dashboard"
                activeClassName="block font-bold text-emerald-500 hover:underline"
              />
              <Link href="/about" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/about", "About Us")}</Link>
              <Link href="/contact" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/contact", "Contact Support")}</Link>
              <Link href="/qa" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/qa", "Q&A Knowledgebase")}</Link>
              <Link href="/privacy" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/privacy", "Privacy Policy")}</Link>
              <Link href="/terms" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/terms", "Terms of Service")}</Link>
              <Link href="/sitemap" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all">{t("/sitemap", "HTML Sitemap")}</Link>
              <Link href="/embed" className="block hover:text-[var(--foreground)] hover:translate-x-0.5 transition-all" rel="nofollow">Embeddable Widget</Link>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--foreground)]">
            {isEs ? ES_FOOTER_COPY.trustBadge : "🛡️ 100% Privacy-First & Zero Ad Tracking"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {isEs
              ? `${CORE_TOOL_COUNT} herramientas gratuitas + ${PROFESSIONAL_TOOL_COUNT} profesionales · el procesamiento principal ocurre en tu navegador`
              : `${CORE_TOOL_COUNT} free core PDF tools + ${PROFESSIONAL_TOOL_COUNT} professional tools · all core processing stays in your browser`}
          </p>
        </div>

        <div className="border-t border-[var(--card-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-start sm:items-center gap-2 max-w-xl">
            <span className="w-2 h-2 mt-1 sm:mt-0 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            <span data-footer-ad-policy>
              {FOOTER_PRIVACY_LINE}{" "}
              <Link href="/privacy" className="underline hover:text-[var(--foreground)]">{t("/privacy", "Privacy Policy")}</Link>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p>
              &copy; {new Date().getFullYear()} PDFTools (allaboutpdfediting.xyz).{" "}
              {isEs ? ES_FOOTER_COPY.rights : "All rights reserved."}
            </p>
            <details className="inline-block">
              <summary
                className="list-none cursor-pointer text-[var(--muted)]/40 hover:text-[var(--muted)] select-none"
                aria-label="Directory listings"
              >
                &middot;
              </summary>
              <div className="mt-2">
                <a
                  href="https://launchpadly.co/startup/pdf-tools?ref=badge"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-launchpadly-badge="pdf-tools"
                  data-launchpadly-badge-variant="listed-on"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://launchpadly.co/embed/badges/startup/pdf-tools.svg?variant=listed-on"
                    alt="Launchpadly Startup Directory"
                    width="260"
                    height="48"
                    style={{ display: "block", border: 0 }}
                  />
                </a>
              </div>
            </details>
          </div>
        </div>
      </div>
    </footer>
  );
}
