export type ToolCategory =
  | "Popular"
  | "Studio & AI"
  | "Edit"
  | "Convert"
  | "Security"
  | "Organize"
  | "Premium";

export interface ToolDefinition {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  category: ToolCategory;
  badge?: string;
  hasFreePreview?: boolean;
}

/**
 * The single source of truth for every advertised PDF tool and its tier.
 * Premium subscribers also receive the larger limits on every free tool.
 */
export const TOOL_CATALOG: readonly ToolDefinition[] = [
  { title: "PDF Studio Pipeline", description: "Reorder, delete, sign, watermark, protect, and compress without re-uploading.", icon: "⚡", href: "/studio", gradient: "bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500", category: "Studio & AI", badge: "Flagship" },
  { title: "PII Guardian", description: "Preview common PII matches locally; Premium securely redacts complete documents.", icon: "🛡️", href: "/pii-guardian", gradient: "bg-gradient-to-br from-red-500 via-rose-600 to-amber-600", category: "Premium", hasFreePreview: true },
  { title: "PDF Automation Recipes", description: "Run multi-step PDF workflows; two starter recipes are available as a free preview.", icon: "⚡", href: "/recipes", gradient: "bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-500", category: "Premium", hasFreePreview: true },
  { title: "Chat with PDF AI", description: "Ask questions, summarize, simplify, or translate extracted PDF text with a free daily preview.", icon: "🤖", href: "/chat-pdf", gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600", category: "Premium", hasFreePreview: true },

  { title: "Compress PDF", description: "Choose structure-preserving optimization or stronger raster compression.", icon: "📦", href: "/compress", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Popular" },
  { title: "Merge PDF", description: "Combine multiple PDF documents in your chosen order.", icon: "🔗", href: "/merge", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600", category: "Popular" },
  { title: "Split PDF", description: "Extract a page range or package individual pages in a ZIP archive.", icon: "✂️", href: "/split", gradient: "bg-gradient-to-br from-purple-500 to-pink-600", category: "Popular" },

  { title: "Image to PDF", description: "Combine JPEG and PNG images into one PDF, with one image per page.", icon: "🖼️", href: "/image-to-pdf", gradient: "bg-gradient-to-br from-amber-500 to-orange-600", category: "Convert" },
  { title: "e-Sign PDF", description: "Draw a visible signature and place it on a PDF page.", icon: "✍️", href: "/sign", gradient: "bg-gradient-to-br from-pink-500 to-rose-600", category: "Security" },
  { title: "OCR PDF", description: "Run English OCR on scanned pages, then copy or download the extracted text.", icon: "🔍", href: "/ocr-pdf", gradient: "bg-gradient-to-br from-purple-500 to-indigo-600", category: "Studio & AI" },
  { title: "Delete Pages", description: "Visually select and remove unwanted pages from a PDF.", icon: "🗑️", href: "/delete-pages", gradient: "bg-gradient-to-br from-red-500 to-rose-600", category: "Organize" },
  { title: "Organize Pages", description: "Reorder PDF pages with numbered page tiles and export the new sequence.", icon: "📑", href: "/organize", gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-600", category: "Organize" },
  { title: "Edit PDF", description: "Overlay editable text boxes, rectangles, circles, and lines on PDF pages.", icon: "✏️", href: "/edit-pdf", gradient: "bg-gradient-to-br from-orange-500 to-amber-600", category: "Edit" },
  { title: "PDF to Word", description: "Extract text into a simple editable DOCX without reproducing the original layout.", icon: "📄", href: "/pdf-to-word", gradient: "bg-gradient-to-br from-blue-600 to-blue-800", category: "Convert" },
  { title: "Word to PDF", description: "Convert DOCX text and basic headings, lists, and tables into a simplified PDF.", icon: "📝", href: "/word-to-pdf", gradient: "bg-gradient-to-br from-green-500 to-emerald-700", category: "Convert" },
  { title: "PDF to CSV", description: "Heuristically extract positioned PDF text into CSV rows.", icon: "📊", href: "/pdf-to-excel", gradient: "bg-gradient-to-br from-emerald-500 to-teal-700", category: "Convert" },
  { title: "Watermark PDF", description: "Stamp custom text watermarks with configurable opacity and rotation.", icon: "💧", href: "/watermark", gradient: "bg-gradient-to-br from-cyan-500 to-blue-600", category: "Security" },
  { title: "Password Protect", description: "Secure confidential PDFs with AES-256 password encryption.", icon: "🔒", href: "/protect", gradient: "bg-gradient-to-br from-violet-500 to-purple-700", category: "Security" },
  { title: "Unlock PDF", description: "Remove a known PDF password and export an unencrypted copy.", icon: "🔓", href: "/unlock", gradient: "bg-gradient-to-br from-amber-500 to-orange-600", category: "Security" },
  { title: "Rotate PDF", description: "Rotate PDF pages by 90, 180, or 270 degrees.", icon: "🔄", href: "/rotate", gradient: "bg-gradient-to-br from-red-500 to-orange-600", category: "Organize" },
  { title: "Crop PDF", description: "Set top, bottom, left, and right crop margins in points or millimeters.", icon: "🔲", href: "/crop", gradient: "bg-gradient-to-br from-rose-500 to-pink-600", category: "Edit" },
  { title: "Resize PDF", description: "Change page boundaries to a preset or custom size without scaling content.", icon: "📐", href: "/resize", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Edit" },
  { title: "Add Page Numbers", description: "Insert sequential page numbers in one of six page positions.", icon: "🔢", href: "/add-page-numbers", gradient: "bg-gradient-to-br from-cyan-500 to-teal-600", category: "Organize" },
  { title: "Fill PDF Form", description: "Type into AcroForm fields, check boxes, and download the completed form.", icon: "📋", href: "/fill-form", gradient: "bg-gradient-to-br from-lime-500 to-emerald-600", category: "Edit" },
  { title: "Flatten PDF", description: "Render visible page content into non-interactive page images.", icon: "📄", href: "/flatten-pdf", gradient: "bg-gradient-to-br from-stone-500 to-slate-700", category: "Security" },
  { title: "PDF to Images", description: "Render PDF pages as PNG or JPEG and download them individually or as a ZIP.", icon: "📸", href: "/pdf-to-images", gradient: "bg-gradient-to-br from-rose-500 to-red-600", category: "Convert" },
  { title: "Scan to PDF", description: "Capture or select camera photos and combine them into a PDF.", icon: "📷", href: "/scan-to-pdf", gradient: "bg-gradient-to-br from-sky-500 to-blue-600", category: "Convert" },
  { title: "HTML to PDF", description: "Render pasted HTML markup into a rasterized PDF in your browser.", icon: "🌐", href: "/html-to-pdf", gradient: "bg-gradient-to-br from-sky-400 to-indigo-600", category: "Convert" },
  { title: "Text to PDF", description: "Convert entered plain text into clean, automatically paginated PDF pages.", icon: "📝", href: "/text-to-pdf", gradient: "bg-gradient-to-br from-green-500 to-teal-600", category: "Convert" },
  { title: "Re-save PDF", description: "Re-serialize a readable PDF to rebuild its cross-reference structure.", icon: "🔧", href: "/repair-pdf", gradient: "bg-gradient-to-br from-stone-500 to-slate-800", category: "Edit" },
  { title: "Redact PDF", description: "Draw permanent, image-based blackout areas over sensitive content.", icon: "⬛", href: "/redact", gradient: "bg-gradient-to-br from-slate-700 to-black", category: "Security" },
  { title: "Word Counter", description: "Count extracted words, characters, pages, and estimated reading time.", icon: "📝", href: "/word-counter", gradient: "bg-gradient-to-br from-teal-500 to-emerald-600", category: "Convert" },
  { title: "Insert Blank Pages", description: "Insert blank pages at selected positions for notes or printing.", icon: "📄", href: "/insert-blank", gradient: "bg-gradient-to-br from-sky-500 to-indigo-700", category: "Organize" },
  { title: "Annotate PDF", description: "Burn visual highlights, underlines, and strikethrough lines onto pages.", icon: "🖍️", href: "/annotate", gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", category: "Edit" },
  { title: "Extract Text", description: "Extract selectable text from every PDF page and download it as text.", icon: "📋", href: "/extract-text", gradient: "bg-gradient-to-br from-cyan-500 to-blue-700", category: "Convert" },
  { title: "Metadata Editor", description: "View and edit PDF title, author, subject, and keywords.", icon: "🏷️", href: "/metadata", gradient: "bg-gradient-to-br from-slate-500 to-indigo-700", category: "Edit" },
  { title: "PDF to PDF/A", description: "Add PDF/A-2B identification, XMP metadata, and an sRGB output intent.", icon: "🗄️", href: "/pdf-to-pdfa", gradient: "bg-gradient-to-br from-blue-500 to-slate-700", category: "Convert" },
  { title: "Reverse PDF", description: "Reverse the complete page sequence of a PDF.", icon: "↕️", href: "/reverse-pdf", gradient: "bg-gradient-to-br from-purple-500 to-indigo-700", category: "Organize" },
  { title: "PDF to Audio", description: "Read selectable PDF text aloud using voices available in your browser.", icon: "🎧", href: "/pdf-to-audio", gradient: "bg-gradient-to-br from-rose-500 to-pink-600", category: "Studio & AI" },
  { title: "Color Inverter", description: "Render a PDF in dark mode, grayscale, or high contrast.", icon: "🎨", href: "/pdf-inverter", gradient: "bg-gradient-to-br from-violet-500 to-purple-600", category: "Edit" },
  { title: "Secure Vault", description: "Store client-encrypted PDFs in this browser with a master password.", icon: "🔐", href: "/vault", gradient: "bg-gradient-to-br from-cyan-500 to-blue-600", category: "Security" },
  { title: "QR Code Stamp", description: "Stamp a generated QR code at a selected position on every PDF page.", icon: "📱", href: "/qr-stamp", gradient: "bg-gradient-to-br from-green-500 to-emerald-700", category: "Security" },

  { title: "Batch Process", description: "Apply configured compression, protection, rotation, or watermark jobs to multiple PDFs.", icon: "⚙️", href: "/batch", gradient: "bg-gradient-to-br from-slate-500 to-slate-800", category: "Premium" },
  { title: "PDF Diff", description: "Compare rendered pages and review heuristic extracted-text additions and deletions.", icon: "🔍", href: "/pdf-diff", gradient: "bg-gradient-to-br from-teal-500 to-cyan-600", category: "Premium" },
  { title: "Bates Numbering", description: "Add legal Bates stamps with custom prefixes, suffixes, and digit padding.", icon: "🔢", href: "/bates-numbering", gradient: "bg-gradient-to-br from-amber-500 to-yellow-600", category: "Premium" },
  { title: "Certificate Generator", description: "Generate personalized PDF certificates in bulk from a template and CSV.", icon: "🏆", href: "/certificate-generator", gradient: "bg-gradient-to-br from-purple-500 to-indigo-700", category: "Premium" },
  { title: "Form Data Extraction", description: "Extract AcroForm responses from multiple PDFs into a CSV spreadsheet.", icon: "📊", href: "/form-data-extract", gradient: "bg-gradient-to-br from-emerald-500 to-teal-700", category: "Premium" },
  { title: "Bulk Rename", description: "Rename multiple PDFs using embedded metadata and naming patterns.", icon: "🏷️", href: "/bulk-rename", gradient: "bg-gradient-to-br from-blue-500 to-indigo-600", category: "Premium" },
  { title: "Booklet Creator", description: "Create saddle-stitch, 2-up, 2×2, or 4×4 print imposition layouts.", icon: "📖", href: "/booklet", gradient: "bg-gradient-to-br from-orange-500 to-red-600", category: "Premium" },
  { title: "Search & Redact", description: "Find phrases across a document and securely redact every selected occurrence.", icon: "⬛", href: "/search-redact", gradient: "bg-gradient-to-br from-slate-700 to-gray-950", category: "Premium" },
  { title: "Metadata Sanitizer", description: "Strip document properties, annotations, JavaScript, and embedded files.", icon: "🧹", href: "/metadata-sanitizer", gradient: "bg-gradient-to-br from-yellow-500 to-orange-700", category: "Premium" },
  { title: "Split by Bookmarks", description: "Extract chapters from a PDF outline and package them in a ZIP archive.", icon: "📑", href: "/split-by-bookmarks", gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600", category: "Premium" },
] as const;

export const PREMIUM_TOOLS = TOOL_CATALOG.filter((tool) => tool.category === "Premium");
export const FREE_TOOLS = TOOL_CATALOG.filter((tool) => tool.category !== "Premium");
export const PREMIUM_TOOL_COUNT = PREMIUM_TOOLS.length;
export const FREE_TOOL_COUNT = FREE_TOOLS.length;

export const FREE_RECIPE_IDS = ["academic_grant_submission", "executive_signoff"] as const;
export const STARTER_RECIPE_IDS = FREE_RECIPE_IDS;

export function isPremiumTool(hrefOrSlug: string): boolean {
  const href = hrefOrSlug.startsWith("/") ? hrefOrSlug : `/${hrefOrSlug}`;
  return PREMIUM_TOOLS.some((tool) => tool.href === href);
}

export function isFreeRecipe(recipeId: string): boolean {
  return (FREE_RECIPE_IDS as readonly string[]).includes(recipeId);
}
