/**
 * Blog post → matching tool-route map.
 *
 * Every `/blog/*` article renders `<BlogToolCta slug="…">` near the top and at
 * the bottom. Keeping the mapping here (instead of copy-pasting links into 52
 * page files) means a route change is a one-line edit, and the guard test
 * `src/__tests__/blogToolCta.test.ts` proves that every article has a mapping
 * and that every mapped route actually exists on disk.
 */
export interface BlogToolCtaConfig {
  /** Existing tool route, e.g. "/compress". Never a /blog route. */
  href: string;
  /** Tool name shown on the button. */
  toolName: string;
  /** One-line benefit shown in the top banner. */
  blurb: string;
  /** Practical bullets shown on the closing card. */
  bullets: string[];
}

export const BLOG_TOOL_CTAS: Record<string, BlogToolCtaConfig> = {
  "add-page-numbers-to-pdf": {
    href: "/add-page-numbers",
    toolName: "Add Page Numbers",
    blurb: "number every page in six positions, with your own start value and format.",
    bullets: [
      "Choose top/bottom placement and left, centre, or right alignment",
      "Start numbering at any page with a custom prefix or suffix",
      "Runs locally with pdf-lib — the file is never uploaded",
    ],
  },
  "add-qr-code-to-pdf": {
    href: "/qr-stamp",
    toolName: "QR Code Stamp",
    blurb: "stamp a scannable QR code onto every page at the position you choose.",
    bullets: [
      "Generate the QR code in your browser — no external image service",
      "Place it on every page or a single page, with adjustable size",
      "Useful for payment links, verification URLs, and document tracking",
    ],
  },
  "add-watermark-to-pdf": {
    href: "/watermark",
    toolName: "Watermark PDF",
    blurb: "stamp custom text watermarks with adjustable opacity and rotation.",
    bullets: [
      "Set text, font size, opacity, and diagonal or horizontal rotation",
      "Mark drafts, confidential copies, and client previews in seconds",
      "Client-side processing keeps unreleased documents private",
    ],
  },
  "ai-pdf-summarization": {
    href: "/chat-pdf",
    toolName: "Chat with PDF",
    blurb: "summarise, question, and simplify any PDF with a free daily AI preview.",
    bullets: [
      "Ask for key points, decisions, deadlines, or a plain-language summary",
      "Only extracted text is sent to the AI — the PDF itself stays local",
      "Free preview included; Premium lifts the daily question limit",
    ],
  },
  "annotate-pdf-online": {
    href: "/annotate",
    toolName: "Annotate PDF",
    blurb: "burn highlights, underlines, and strikethroughs onto pages in one pass.",
    bullets: [
      "Drag to highlight the exact passages a reviewer needs to see",
      "Marks are flattened into the page so they survive any viewer",
      "No account, no upload, no watermark on the output",
    ],
  },
  "automate-pdf-workflow": {
    href: "/recipes",
    toolName: "PDF Automation Recipes",
    blurb: "run repeatable multi-step PDF workflows as one-click recipes.",
    bullets: [
      "Chain compress, watermark, protect, and rename into a single run",
      "Two starter recipes are free; Premium unlocks the full library",
      "Every step runs in your browser — no queue, no server render",
    ],
  },
  "batch-process-pdf-online": {
    href: "/batch",
    toolName: "Batch Process",
    blurb: "apply one operation to a whole folder of PDFs at once.",
    bullets: [
      "Compress, rotate, protect, or watermark up to 20 files per run",
      "See per-file progress and download results individually",
      "Professional tool — trial files available before you upgrade",
    ],
  },
  "bates-numbering-pdf": {
    href: "/bates-numbering",
    toolName: "Bates Numbering",
    blurb: "add legal Bates stamps with custom prefix, suffix, and digit padding.",
    bullets: [
      "Set prefix, start number, padding, and corner placement",
      "Keeps page order intact for deposition and exhibit bundles",
      "Professional tool with a shared 5-file lifetime trial",
    ],
  },
  "bulk-rename-pdf-files": {
    href: "/bulk-rename",
    toolName: "Bulk Rename",
    blurb: "rename batches of PDFs from their own embedded metadata.",
    bullets: [
      "Build naming patterns from title, author, subject, or page count",
      "Preview the new filenames before applying them",
      "Files are read locally, so client documents never leave your device",
    ],
  },
  "chat-with-pdf-ai": {
    href: "/chat-pdf",
    toolName: "Chat with PDF",
    blurb: "ask questions of a document and get answers grounded in its text.",
    bullets: [
      "Great for contracts, research papers, reports, and manuals",
      "Only extracted text is transmitted — never the raw PDF",
      "3 free questions per day; Premium removes the cap",
    ],
  },
  "clean-pdf-metadata": {
    href: "/metadata-sanitizer",
    toolName: "Metadata Sanitizer",
    blurb: "strip author, title, annotations, JavaScript, and embedded files.",
    bullets: [
      "Remove hidden document properties before publishing a PDF",
      "Also clears annotations, embedded files, and scripting",
      "Professional tool — the free Metadata Editor handles basic fields",
    ],
  },
  "compare-pdfs-online": {
    href: "/pdf-diff",
    toolName: "PDF Diff",
    blurb: "compare two versions side by side and review what actually changed.",
    bullets: [
      "Rendered page comparison plus extracted-text additions and deletions",
      "Useful for contract redlines, policy revisions, and proof checks",
      "Professional tool with a shared 5-file lifetime trial",
    ],
  },
  "compress-scanned-pdf-under-1mb": {
    href: "/compress",
    toolName: "Compress PDF",
    blurb: "shrink a scanned PDF with Balanced or Maximum compression.",
    bullets: [
      "Balanced keeps detail; Maximum pushes the file size down hardest",
      "Compare both outputs before you submit to a strict portal",
      "Core tool: free, unlimited, and fully in-browser",
    ],
  },
  "convert-html-to-pdf": {
    href: "/html-to-pdf",
    toolName: "HTML to PDF",
    blurb: "render pasted HTML markup into a downloadable PDF page set.",
    bullets: [
      "Paste markup and render it in your own browser",
      "Good for saved snippets, simple reports, and offline handouts",
      "Core tool: unlimited and account-free",
    ],
  },
  "convert-pdf-to-audio": {
    href: "/pdf-to-audio",
    toolName: "PDF to Audio",
    blurb: "listen to selectable PDF text with the voices built into your browser.",
    bullets: [
      "Pick a system voice, speed, and playback position",
      "Handy for proofreading, accessibility, and commute reading",
      "Text extraction happens locally; nothing is uploaded",
    ],
  },
  "convert-pdf-to-excel": {
    href: "/pdf-to-excel",
    toolName: "PDF to CSV",
    blurb: "extract positioned PDF text into rows you can open in Excel.",
    bullets: [
      "Best results from PDFs with real, selectable text",
      "Review the CSV before importing — layout is inferred heuristically",
      "Core tool: free and unlimited",
    ],
  },
  "convert-pdf-to-images": {
    href: "/pdf-to-images",
    toolName: "PDF to Images",
    blurb: "render pages as PNG or JPEG and download them individually or zipped.",
    bullets: [
      "Choose image format and resolution before rendering",
      "Handles multi-page documents with a ZIP download",
      "Runs on canvas in your browser — no server render",
    ],
  },
  "convert-pdf-to-pdfa": {
    href: "/pdf-to-pdfa",
    toolName: "PDF to PDF/A",
    blurb: "add PDF/A-2B identification, XMP metadata, and an sRGB output intent.",
    bullets: [
      "Improves long-term archiving compatibility for records teams",
      "Writes the identification and output-intent metadata explicitly",
      "Free, unlimited, and processed entirely in the browser",
    ],
  },
  "convert-pdf-to-word": {
    href: "/pdf-to-word",
    toolName: "PDF to Word",
    blurb: "extract text into an editable DOCX you can open in Word or Google Docs.",
    bullets: [
      "Keeps paragraphs, headings, and simple lists readable",
      "Works best on PDFs that contain real text, not scans",
      "Free and unlimited — no email required",
    ],
  },
  "convert-word-to-pdf": {
    href: "/word-to-pdf",
    toolName: "Word to PDF",
    blurb: "turn DOCX text, headings, lists, and tables into a clean PDF.",
    bullets: [
      "Simple, predictable layout without a desktop suite",
      "No upload: the DOCX is parsed in your browser",
      "Free and unlimited for every core user",
    ],
  },
  "create-pdf-booklet": {
    href: "/booklet",
    toolName: "Booklet Creator",
    blurb: "impose pages into saddle-stitch, 2-up, 2×2, or 4×4 print layouts.",
    bullets: [
      "Print-ready imposition without buying desktop publishing software",
      "Preview the sheet order before printing double-sided",
      "Professional tool with a 5-file lifetime trial",
    ],
  },
  "crop-pdf-margins": {
    href: "/crop",
    toolName: "Crop PDF",
    blurb: "trim scan borders and whitespace with precise margin values.",
    bullets: [
      "Set top, bottom, left, and right margins in points or millimetres",
      "Removes scanner black edges before archiving or filing",
      "Free, unlimited, and fully in-browser",
    ],
  },
  "delete-pages-from-pdf": {
    href: "/delete-pages",
    toolName: "Delete Pages",
    blurb: "visually select and remove the pages you do not need.",
    bullets: [
      "Click page thumbnails to mark them for removal",
      "Keep the original file untouched until you download",
      "Free and unlimited — no page cap on core tools",
    ],
  },
  "edit-pdf-online": {
    href: "/edit-pdf",
    toolName: "Edit PDF",
    blurb: "overlay text boxes, shapes, dates, and notes directly on a page.",
    bullets: [
      "Add text, rectangles, circles, and lines at exact positions",
      "Download a flattened, share-ready copy immediately",
      "No install and no account — everything runs locally",
    ],
  },
  "extract-pdf-form-data": {
    href: "/form-data-extract",
    toolName: "Form Data Extraction",
    blurb: "pull AcroForm responses from many PDFs into one CSV spreadsheet.",
    bullets: [
      "Collect hundreds of filled forms into a single dataset",
      "Keeps field names as CSV columns for easy review",
      "Professional tool — 5 trial files included",
    ],
  },
  "extract-text-from-pdf": {
    href: "/extract-text",
    toolName: "Extract Text",
    blurb: "pull selectable text from every page into a plain text file.",
    bullets: [
      "Useful for quoting, translation, and search across long documents",
      "Page-by-page output so you can trace where text came from",
      "Free and unlimited with local extraction",
    ],
  },
  "fill-pdf-forms-online": {
    href: "/fill-form",
    toolName: "Fill PDF Form",
    blurb: "type into AcroForm fields and check boxes, then download the form.",
    bullets: [
      "Works on real form fields, not flat page images",
      "Save a completed copy without printing or scanning",
      "Free, unlimited, and processed in your browser",
    ],
  },
  "flatten-pdf-online": {
    href: "/flatten-pdf",
    toolName: "Flatten PDF",
    blurb: "bake form fields and annotations into fixed, non-editable pages.",
    bullets: [
      "Stop recipients from editing fields after you submit",
      "Produces a consistent copy that renders identically everywhere",
      "Free and unlimited for core users",
    ],
  },
  "generate-pdf-certificates": {
    href: "/certificate-generator",
    toolName: "Certificate Generator",
    blurb: "generate personalised certificates in bulk from a template and CSV.",
    bullets: [
      "One CSV row per recipient — names, dates, course titles",
      "Outputs individual PDFs instead of hand-editing each one",
      "Professional tool with a shared 5-file lifetime trial",
    ],
  },
  "google-drive-pdf-editor": {
    href: "/edit-pdf",
    toolName: "Edit PDF",
    blurb: "download a Drive PDF, edit it locally, and upload the result back.",
    bullets: [
      "Nothing is uploaded to a third-party PDF server in between",
      "Overlay text and shapes, then save the flattened copy",
      "Pairs with Merge and Compress for bigger Drive clean-ups",
    ],
  },
  "how-to-compress-pdf": {
    href: "/compress",
    toolName: "Compress PDF",
    blurb: "reduce PDF file size with lossless or visual compression modes.",
    bullets: [
      "Lossless rebuilds structure and keeps text selectable",
      "Balanced and Maximum rebuild pages as optimised images",
      "Free and unlimited — no daily cap",
    ],
  },
  "how-to-convert-image-to-pdf": {
    href: "/image-to-pdf",
    toolName: "Image to PDF",
    blurb: "combine JPG, PNG, and WebP images into a single PDF.",
    bullets: [
      "One image per page, in the order you choose",
      "Handles photos of documents, receipts, and hand-written notes",
      "Free and unlimited, with no upload to any server",
    ],
  },
  "how-to-merge-pdf": {
    href: "/merge",
    toolName: "Merge PDF",
    blurb: "combine several PDFs into one document in your chosen order.",
    bullets: [
      "Drag to reorder files before merging",
      "Preserves original fonts, images, and page sizes",
      "Free and unlimited — no watermark added",
    ],
  },
  "insert-blank-pages-pdf": {
    href: "/insert-blank",
    toolName: "Insert Blank Pages",
    blurb: "add blank pages at exact positions for notes, dividers, or printing.",
    bullets: [
      "Insert before or after any page number",
      "Keeps duplex printing section breaks aligned",
      "Free, unlimited, and fully client-side",
    ],
  },
  "invert-pdf-colors": {
    href: "/pdf-inverter",
    toolName: "Color Inverter",
    blurb: "render a PDF in dark mode, grayscale, or high contrast.",
    bullets: [
      "Easier night reading without hurting your eyes",
      "High-contrast output for accessibility handouts",
      "Free core tool — the whole render happens locally",
    ],
  },
  "ocr-pdf-online": {
    href: "/ocr-pdf",
    toolName: "OCR PDF",
    blurb: "run English OCR on scanned pages and copy or download the text.",
    bullets: [
      "Turns image-only scans into searchable, quotable text",
      "Preview the recognised text before you rely on it",
      "Free tier runs OCR in your browser; AI OCR is a Premium upgrade",
    ],
  },
  "organize-pdf-pages": {
    href: "/organize",
    toolName: "Organize Pages",
    blurb: "reorder pages with numbered tiles and export the new sequence.",
    bullets: [
      "Move chapters, appendices, and scans into the right order",
      "Visual tiles make large documents easy to shuffle",
      "Free and unlimited with no upload",
    ],
  },
  "pdf-vs-image": {
    href: "/image-to-pdf",
    toolName: "Image to PDF",
    blurb: "convert photos into a document format that stays consistent.",
    bullets: [
      "One PDF instead of a folder of loose images",
      "Keeps pages in order for email and forms portals",
      "Free and unlimited in your browser",
    ],
  },
  "protect-pdf-with-password": {
    href: "/protect",
    toolName: "Password Protect",
    blurb: "encrypt confidential PDFs with AES-256 before you send them.",
    bullets: [
      "Encryption is applied in your browser — the password never leaves it",
      "Share the password over a different channel than the file",
      "Free and unlimited; Unlock PDF reverses it when you have the password",
    ],
  },
  "redact-pdf-for-foia-request": {
    href: "/redact",
    toolName: "Redact PDF",
    blurb: "apply permanent, image-based blackouts to authorised exemptions.",
    bullets: [
      "Rasterises the page so hidden text cannot be recovered",
      "Verify every page at 100% zoom before release",
      "Free core tool — nothing is uploaded during redaction",
    ],
  },
  "redact-pdf-online": {
    href: "/redact",
    toolName: "Redact PDF",
    blurb: "draw permanent blackout areas over sensitive content.",
    bullets: [
      "Redaction is burned into pixels, not painted over",
      "Works on scanned and digital documents alike",
      "Free and unlimited — keep a clean original for your records",
    ],
  },
  "remove-password-from-pdf": {
    href: "/unlock",
    toolName: "Unlock PDF",
    blurb: "remove a password you already know and export an unlocked copy.",
    bullets: [
      "Requires the current password — this is not a cracker",
      "Useful for removing an old owner password from your own files",
      "Free and unlimited, processed in-browser",
    ],
  },
  "repair-pdf-online": {
    href: "/repair-pdf",
    toolName: "Re-save PDF",
    blurb: "rebuild a readable PDF's cross-reference structure.",
    bullets: [
      "Fixes documents that refuse to open or render after a bad export",
      "Re-serialises the file instead of altering page content",
      "Free and unlimited for core users",
    ],
  },
  "resize-pdf-pages": {
    href: "/resize",
    toolName: "Resize PDF",
    blurb: "change page boundaries to A4, Letter, or a custom size.",
    bullets: [
      "Standardise mixed page sizes for printing and filing",
      "Preset and custom dimensions in points or millimetres",
      "Free and unlimited — no quality re-encoding",
    ],
  },
  "reverse-pdf-pages": {
    href: "/reverse-pdf",
    toolName: "Reverse PDF",
    blurb: "flip the complete page sequence of a document.",
    bullets: [
      "Fix scans that were fed into the ADF in reverse order",
      "One click for the whole document instead of manual shuffling",
      "Free and unlimited in your browser",
    ],
  },
  "rotate-pdf-pages-online": {
    href: "/rotate",
    toolName: "Rotate PDF",
    blurb: "rotate pages by 90, 180, or 270 degrees — all or a selection.",
    bullets: [
      "Correct sideways scans and landscape inserts",
      "Rotation is written into the PDF, so it sticks in every viewer",
      "Free and unlimited with no upload",
    ],
  },
  "scan-to-pdf": {
    href: "/scan-to-pdf",
    toolName: "Scan to PDF",
    blurb: "capture documents with your camera and assemble them into a PDF.",
    bullets: [
      "Replaces a desktop scanner for quick paperwork",
      "Combine multiple captured pages into one file",
      "Free and unlimited — images never leave your device",
    ],
  },
  "secure-pdf-vault": {
    href: "/vault",
    toolName: "Secure Vault",
    blurb: "store client-encrypted PDFs in this browser behind a master password.",
    bullets: [
      "AES-256-GCM with PBKDF2 key derivation, stored in IndexedDB",
      "Only this browser can decrypt the files — no server copy exists",
      "Remember the master password: it cannot be recovered",
    ],
  },
  "sign-pdf-without-printing": {
    href: "/sign",
    toolName: "e-Sign PDF",
    blurb: "draw a signature and place it on the exact page position.",
    bullets: [
      "Draw once, reuse on any page or document",
      "No printing, scanning, or mailing a paper copy",
      "Free and unlimited — signatures stay on your device",
    ],
  },
  "split-pdf-by-bookmarks": {
    href: "/split-by-bookmarks",
    toolName: "Split by Bookmarks",
    blurb: "extract chapters from a PDF outline and package them in a ZIP.",
    bullets: [
      "Uses the document's own bookmarks as split boundaries",
      "Ideal for textbooks, manuals, and bundled reports",
      "Professional tool with a 5-file lifetime trial",
    ],
  },
  "split-pdf-pages-online": {
    href: "/split",
    toolName: "Split PDF",
    blurb: "extract page ranges or package every page as its own file.",
    bullets: [
      "Custom ranges like 1-5, 8, 11-15",
      "ZIP download when you split into many files",
      "Free and unlimited with local processing",
    ],
  },
  "text-to-pdf-converter": {
    href: "/text-to-pdf",
    toolName: "Text to PDF",
    blurb: "turn plain text into clean, automatically paginated PDF pages.",
    bullets: [
      "Paste notes, transcripts, or code and export a tidy PDF",
      "Wraps and paginates long text without manual breaks",
      "Free and unlimited — nothing is uploaded",
    ],
  },
  "word-counter-online": {
    href: "/word-counter",
    toolName: "Word Counter",
    blurb: "count words, characters, pages, and estimated reading time.",
    bullets: [
      "Check abstract and essay limits before submission",
      "Works on extracted PDF text directly in the browser",
      "Free and unlimited with no signup",
    ],
  },
};

export function getBlogToolCta(slug: string): BlogToolCtaConfig | undefined {
  return BLOG_TOOL_CTAS[slug];
}
