import type { Metadata } from "next";
import Link from "next/link";
import { seoPages } from "@/lib/programmatic-seo";

export const metadata: Metadata = {
  title: "Sitemap — PDFTools",
  description: "Complete sitemap for PDFTools — browse all free online PDF tools, use cases, and resources.",
};

interface Group {
  title: string;
  links: { href: string; label: string }[];
}

const audienceLabels: Record<string, string> = {
  "college-students": "College Students",
  "high-school-students": "High School Students",
  teachers: "Teachers",
  "office-workers": "Office Workers",
  freelancers: "Freelancers",
  "small-business-owners": "Small Business Owners",
  "job-seekers": "Job Seekers",
  recruiters: "Recruiters",
  researchers: "Researchers",
  lawyers: "Lawyers",
  accountants: "Accountants",
  "healthcare-workers": "Healthcare Workers",
  "real-estate-agents": "Real Estate Agents",
  "students-abroad": "International Students",
  "remote-workers": "Remote Workers",
};

const tools = [
  { slug: "compress", name: "Compress PDF" },
  { slug: "merge", name: "Merge PDF" },
  { slug: "split", name: "Split PDF" },
  { slug: "image-to-pdf", name: "Image to PDF" },
  { slug: "edit-pdf", name: "Edit PDF" },
  { slug: "protect", name: "Protect PDF" },
  { slug: "sign", name: "Sign PDF" },
  { slug: "pdf-to-word", name: "PDF to Word" },
  { slug: "ocr-pdf", name: "OCR PDF" },
  { slug: "unlock", name: "Unlock PDF" },
  { slug: "rotate", name: "Rotate PDF" },
  { slug: "delete-pages", name: "Delete Pages" },
  { slug: "organize", name: "Organize Pages" },
  { slug: "annotate", name: "Annotate PDF" },
  { slug: "add-page-numbers", name: "Add Page Numbers" },
  { slug: "redact", name: "Redact PDF" },
  { slug: "extract-text", name: "Extract Text" },
  { slug: "watermark", name: "Watermark PDF" },
  { slug: "crop", name: "Crop PDF" },
  { slug: "fill-form", name: "Fill PDF Form" },
];

const groups: Group[] = [
  {
    title: "Popular PDF Tools",
    links: [
      { href: "/compress", label: "Compress PDF" },
      { href: "/merge", label: "Merge PDF" },
      { href: "/split", label: "Split PDF" },
      { href: "/image-to-pdf", label: "Image to PDF" },
      { href: "/edit-pdf", label: "Edit PDF" },
      { href: "/protect", label: "Protect PDF" },
      { href: "/sign", label: "Sign PDF" },
      { href: "/unlock", label: "Unlock PDF" },
      { href: "/rotate", label: "Rotate PDF" },
      { href: "/organize", label: "Organize Pages" },
      { href: "/delete-pages", label: "Delete Pages" },
      { href: "/add-page-numbers", label: "Add Page Numbers" },
      { href: "/annotate", label: "Annotate PDF" },
      { href: "/watermark", label: "Watermark PDF" },
      { href: "/crop", label: "Crop PDF" },
      { href: "/fill-form", label: "Fill PDF Form" },
      { href: "/extract-text", label: "Extract Text" },
      { href: "/redact", label: "Redact PDF" },
      { href: "/html-to-pdf", label: "HTML to PDF" },
      { href: "/pdf-to-word", label: "PDF to Word" },
      { href: "/word-to-pdf", label: "Word to PDF" },
      { href: "/ocr-pdf", label: "OCR PDF" },
      { href: "/pdf-to-images", label: "PDF to Images" },
      { href: "/pdf-to-excel", label: "PDF to Excel" },
      { href: "/scan-to-pdf", label: "Scan to PDF" },
      { href: "/repair-pdf", label: "Repair PDF" },
      { href: "/pdf-to-pdfa", label: "PDF to PDF/A" },
      { href: "/resize", label: "Resize PDF" },
      { href: "/flatten-pdf", label: "Flatten PDF" },
      { href: "/reverse-pdf", label: "Reverse PDF Order" },
      { href: "/insert-blank", label: "Insert Blank Pages" },
      { href: "/word-counter", label: "Word Counter" },
      { href: "/text-to-pdf", label: "Text to PDF" },
      { href: "/metadata", label: "Edit Metadata" },
      { href: "/batch", label: "Batch Process" },
      { href: "/chat-pdf", label: "Chat with PDF" },
    ],
  },
  {
    title: "Premium Tools",
    links: [
      { href: "/pdf-diff", label: "Compare PDFs" },
      { href: "/certificate-generator", label: "Certificate Generator" },
      { href: "/pdf-to-audio", label: "PDF to Audio" },
      { href: "/form-data-extract", label: "Form Data Extraction" },
      { href: "/bulk-rename", label: "Bulk Rename" },
      { href: "/booklet", label: "Booklet Creator" },
      { href: "/search-redact", label: "Search & Redact" },
      { href: "/pdf-inverter", label: "PDF Inverter" },
      { href: "/vault", label: "Secure PDF Vault" },
      { href: "/qr-stamp", label: "QR Code Stamp" },
      { href: "/metadata-sanitizer", label: "Metadata Sanitizer" },
      { href: "/split-by-bookmarks", label: "Split by Bookmarks" },
      { href: "/bates-numbering", label: "Bates Numbering" },
    ],
  },
  {
    title: "Use Cases by Audience",
    links: [
      { href: "/pdf-tools-for-students", label: "PDF Tools for Students" },
      { href: "/pdf-tools-for-teachers", label: "PDF Tools for Teachers" },
      { href: "/pdf-tools-for-lawyers", label: "PDF Tools for Lawyers" },
      { href: "/pdf-tools-for-small-business", label: "PDF Tools for Small Business" },
    ],
  },
  {
    title: "Comparison & Resources",
    links: [
      { href: "/tools", label: "All Tools" },
      { href: "/blog", label: "Blog" },
      { href: "/qa", label: "Q&A" },
      { href: "/ultimate-guide-to-pdf-editing", label: "Ultimate Guide to PDF" },
      { href: "/best-free-pdf-editor", label: "Best Free PDF Editor" },
      { href: "/smallpdf-alternative", label: "Smallpdf Alternative" },
      { href: "/ilovepdf-alternative", label: "ILovePDF Alternative" },
      { href: "/adobe-acrobat-alternative", label: "Adobe Acrobat Alternative" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact" },
      { href: "/premium", label: "Go Premium" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Sitemap</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Browse all pages on PDFTools. You can also view our{" "}
        <a href="/sitemap.xml" className="text-indigo-500 hover:underline">XML sitemap</a>
        {" "}for search engines.
      </p>

      <div className="space-y-10">
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">{group.title}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--muted)] hover:text-indigo-500 transition px-3 py-1.5 rounded-lg hover:bg-[var(--card)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Programmatic SEO pages by audience */}
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Use Cases by Audience</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Each audience has use-case pages for every tool — 300+ pages total.
          </p>
          <div className="space-y-6">
            {Object.entries(audienceLabels).map(([audience, label]) => {
              const pages = seoPages.filter((p) => p.slug.endsWith(`-${audience}`));
              if (pages.length === 0) return null;
              const toolNames = pages.map((p) => p.toolName);
              return (
                <details key={audience} className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] open:shadow-sm transition-all">
                  <summary className="flex items-center justify-between px-5 py-3 cursor-pointer text-sm font-semibold text-[var(--foreground)] hover:text-indigo-600 transition-colors">
                    <span>{label} ({pages.length} pages)</span>
                    <svg className="w-4 h-4 text-[var(--muted)] group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {pages.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/for/${p.slug}`}
                        className="text-xs text-[var(--muted)] hover:text-indigo-500 transition px-2 py-1.5 rounded hover:bg-[var(--background)]"
                      >
                        {p.toolName}
                      </Link>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
