// app/sitemap.ts  (Next.js 13.3+/14/15 App Router)
import type { MetadataRoute } from 'next'

const BASE = 'https://allaboutpdfediting.xyz'

// Slugs that have a Spanish version at /es/<slug>
const ES_SLUGS = new Set(['', 'tools', 'compress', 'merge', 'split', 'image-to-pdf', 'edit-pdf'])

// REAL last-modified dates. Update only when the page content actually changes.
// Best source: blog frontmatter `updatedAt`, a CMS field, or git commit date.
// Fallback below is a fixed date, NOT new Date(), so it doesn't change every build.
const FALLBACK = new Date('2026-09-22')

const TOOLS = [
  'tools', 'studio', 'pii-guardian', 'recipes', 'compress', 'merge', 'split',
  'image-to-pdf', 'scan-to-pdf', 'ocr-pdf', 'edit-pdf', 'repair-pdf', 'pdf-to-pdfa',
  'pdf-to-images', 'extract-text', 'add-page-numbers', 'pdf-to-word', 'word-to-pdf',
  'insert-blank', 'word-counter', 'annotate', 'pdf-to-excel', 'rotate', 'unlock',
  'watermark', 'protect', 'html-to-pdf', 'sign', 'chat-pdf', 'batch', 'delete-pages',
  'text-to-pdf', 'organize', 'metadata', 'resize', 'crop', 'fill-form', 'flatten-pdf',
  'reverse-pdf', 'pdf-diff', 'certificate-generator', 'pdf-to-audio', 'form-data-extract',
  'bulk-rename', 'booklet', 'search-redact', 'pdf-inverter', 'qr-stamp',
  'metadata-sanitizer', 'split-by-bookmarks', 'bates-numbering', 'premium', 'qa',
]

const COMPARE = [
  'vs', 'vs/adobe-acrobat', 'vs/ilovepdf', 'vs/smallpdf',
  // After you 301 the duplicates, DON'T list these:
  // 'adobe-acrobat-alternative', 'ilovepdf-alternative', 'smallpdf-alternative',
  'best-free-pdf-editor', 'ultimate-guide-to-pdf-editing',
  'pdf-tools-for-students', 'pdf-tools-for-teachers', 'pdf-tools-for-lawyers',
  'pdf-tools-for-small-business', 'pdf-tools-for-business',
]

// Replace with your real blog data source (with real dates)
const BLOG: { slug: string; updatedAt?: string }[] = [
  { slug: 'compress-pdf-without-losing-quality' },
  { slug: 'crop-pdf-margins' },
  // ...add the rest, or import from your posts loader:
  // const BLOG = await getAllPosts()
]

function entry(
  slug: string,
  lastModified: Date,
  withEs = false,
): MetadataRoute.Sitemap[number] {
  const path = slug ? `/${slug}` : ''
  const en = `${BASE}${path}`
  const base: MetadataRoute.Sitemap[number] = { url: en, lastModified }

  if (withEs) {
    const es = `${BASE}/es${path}`
    const languages = { en, es, 'x-default': en }
    return [
      { ...base, alternates: { languages } },
      { url: es, lastModified, alternates: { languages } },
    ] as any // flattened below
  }
  return base
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = []
  const push = (slug: string, date: Date) => {
    const r = entry(slug, date, ES_SLUGS.has(slug))
    Array.isArray(r) ? out.push(...r) : out.push(r)
  }

  push('', FALLBACK)
  ;[...TOOLS, ...COMPARE].forEach((s) => push(s, FALLBACK))
  push('blog', FALLBACK)
  BLOG.forEach((p) =>
    push(`blog/${p.slug}`, p.updatedAt ? new Date(p.updatedAt) : FALLBACK),
  )

  // Intentionally omitted: /sitemap (HTML page), /privacy, /terms, /contact, /about
  return out
}
