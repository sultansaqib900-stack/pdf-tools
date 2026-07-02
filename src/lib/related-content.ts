export interface ToolRef {
  title: string;
  href: string;
  description: string;
  icon: string;
}

export interface BlogRef {
  title: string;
  href: string;
  description: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ToolRelatedContent {
  relatedTools: ToolRef[];
  relatedBlogs: BlogRef[];
  faqs: FaqEntry[];
}

const allBlogs: Record<string, BlogRef> = {
  "compress": { title: "How to Compress PDF Without Losing Quality", href: "/blog/how-to-compress-pdf", description: "Learn how to reduce PDF file size while maintaining quality." },
  "merge": { title: "How to Merge Multiple PDFs Into One", href: "/blog/merge-multiple-pdfs-into-one", description: "Combine PDF files into a single document." },
  "split": { title: "How to Split PDF Pages Online", href: "/blog/split-pdf-pages-online", description: "Extract pages or split into separate files." },
  "image-to-pdf": { title: "How to Convert Image to PDF", href: "/blog/how-to-convert-image-to-pdf", description: "Convert JPG, PNG to PDF online." },
  "pdf-to-images": { title: "Convert PDF to Images", href: "/blog/convert-pdf-to-images", description: "Extract pages as high-quality images." },
  "pdf-to-word": { title: "Convert PDF to Word", href: "/blog/convert-pdf-to-word", description: "Convert PDF to editable DOCX files." },
  "word-to-pdf": { title: "Convert Word to PDF", href: "/blog/convert-word-to-pdf", description: "Convert DOCX to PDF format." },
  "pdf-to-excel": { title: "Convert PDF to Excel", href: "/blog/convert-pdf-to-excel", description: "Extract tables from PDF as CSV." },
  "pdf-to-audio": { title: "Convert PDF to Audio", href: "/blog/convert-pdf-to-audio", description: "Listen to PDFs with text-to-speech." },
  "protect": { title: "How to Protect PDF With Password", href: "/blog/protect-pdf-with-password", description: "Encrypt your PDF files." },
  "unlock": { title: "How to Remove Password from PDF", href: "/blog/remove-password-from-pdf", description: "Remove PDF password protection." },
  "sign": { title: "How to Sign PDF Without Printing", href: "/blog/sign-pdf-without-printing", description: "Add digital signatures to PDF." },
  "compress-long": { title: "PDF Compression Guide", href: "/blog/compress-pdf-without-losing-quality", description: "Complete guide to PDF compression." },
  "ocr-pdf": { title: "OCR PDF Online", href: "/blog/ocr-pdf-online", description: "Extract text from scanned PDFs." },
  "edit-pdf": { title: "How to Edit PDF Online", href: "/blog/edit-pdf-online", description: "Add text and shapes to PDFs." },
  "delete-pages": { title: "Delete Pages from PDF", href: "/blog/delete-pages-from-pdf", description: "Remove unwanted pages." },
  "rotate": { title: "Rotate PDF Pages Online", href: "/blog/rotate-pdf-pages-online", description: "Rotate pages by any angle." },
  "organize": { title: "Organize PDF Pages", href: "/blog/organize-pdf-pages", description: "Reorder pages in your PDF." },
  "resize": { title: "Resize PDF Pages", href: "/blog/resize-pdf-pages", description: "Change to A4, Letter, Legal." },
  "crop": { title: "Crop PDF Margins", href: "/blog/crop-pdf-margins", description: "Remove white margins." },
  "watermark": { title: "Add Watermark to PDF", href: "/blog/add-watermark-to-pdf", description: "Add text watermarks." },
  "add-page-numbers": { title: "Add Page Numbers to PDF", href: "/blog/add-page-numbers-to-pdf", description: "Insert page numbers." },
  "annotate": { title: "Annotate PDF Online", href: "/blog/annotate-pdf-online", description: "Highlight and comment on PDF." },
  "redact": { title: "Redact PDF Online", href: "/blog/redact-pdf-online", description: "Black out sensitive content." },
  "extract-text": { title: "Extract Text from PDF", href: "/blog/extract-text-from-pdf", description: "Extract text content from PDF." },
  "metadata": { title: "Edit PDF Metadata", href: "/blog/edit-pdf-metadata", description: "View and edit PDF properties." },
  "fill-form": { title: "Fill PDF Forms Online", href: "/blog/fill-pdf-forms-online", description: "Complete PDF form fields." },
  "flatten-pdf": { title: "Flatten PDF Online", href: "/blog/flatten-pdf-online", description: "Merge layers into content." },
  "html-to-pdf": { title: "Convert HTML to PDF", href: "/blog/convert-html-to-pdf", description: "Convert HTML to PDF." },
  "text-to-pdf": { title: "Text to PDF Converter", href: "/blog/text-to-pdf-converter", description: "Convert plain text to PDF." },
  "word-counter": { title: "Word Counter Online", href: "/blog/word-counter-online", description: "Count words and characters." },
  "scan-to-pdf": { title: "Scan to PDF", href: "/blog/scan-to-pdf", description: "Convert camera images to PDF." },
  "pdf-diff": { title: "Compare PDFs Online", href: "/blog/compare-pdfs-online", description: "Side-by-side PDF comparison." },
  "certificate-generator": { title: "Generate PDF Certificates", href: "/blog/generate-pdf-certificates", description: "Bulk certificate generation." },
  "form-data-extract": { title: "Extract PDF Form Data", href: "/blog/extract-pdf-form-data", description: "Extract form data to CSV." },
  "bulk-rename": { title: "Bulk Rename PDF Files", href: "/blog/bulk-rename-pdf-files", description: "Rename by metadata." },
  "booklet": { title: "Create PDF Booklet", href: "/blog/create-pdf-booklet", description: "N-up booklet creator." },
  "search-redact": { title: "Search and Redact PDF", href: "/blog/search-and-redact-pdf", description: "Auto-redact words." },
  "pdf-inverter": { title: "Invert PDF Colors", href: "/blog/invert-pdf-colors", description: "Dark mode PDF viewer." },
  "vault": { title: "Secure PDF Vault", href: "/blog/secure-pdf-vault", description: "Encrypted document storage." },
  "qr-stamp": { title: "Add QR Code to PDF", href: "/blog/add-qr-code-to-pdf", description: "QR code stamping." },
  "metadata-sanitizer": { title: "Clean PDF Metadata", href: "/blog/clean-pdf-metadata", description: "Strip hidden metadata." },
  "split-by-bookmarks": { title: "Split PDF by Bookmarks", href: "/blog/split-pdf-by-bookmarks", description: "Extract chapters." },
  "bates-numbering": { title: "Bates Numbering PDF", href: "/blog/bates-numbering-pdf", description: "Sequential page numbers." },
  "batch": { title: "Batch Process PDF Online", href: "/blog/batch-process-pdf-online", description: "Process multiple PDFs." },
  "chat-pdf": { title: "Chat with PDF AI", href: "/blog/chat-with-pdf-ai", description: "Ask questions about PDF content." },
  "reverse": { title: "Reverse PDF Pages", href: "/blog/reverse-pdf-pages", description: "Flip page order." },
  "insert-blank": { title: "Insert Blank Pages PDF", href: "/blog/insert-blank-pages-pdf", description: "Add empty pages." },
  "pdf-to-pdfa": { title: "Convert PDF to PDF/A", href: "/blog/convert-pdf-to-pdfa", description: "Archive format conversion." },
};

export const relatedContent: Record<string, ToolRelatedContent> = {
  "compress": {
    relatedTools: [
      { title: "Image to PDF", description: "Convert images to PDF", href: "/image-to-pdf", icon: "🖼️" },
      { title: "Resize PDF", description: "Change page size", href: "/resize", icon: "📐" },
      { title: "PDF to Images", description: "Extract pages as images", href: "/pdf-to-images", icon: "📸" },
    ],
    relatedBlogs: [allBlogs["compress"], allBlogs["compress-long"], allBlogs["pdf-to-images"]],
    faqs: [
      { question: "Does PDF compression reduce quality?", answer: "Our compressor uses smart optimization that reduces file size while preserving visual quality. Text-based PDFs compress very well with no visible quality loss." },
      { question: "How much can I compress a PDF?", answer: "Typical compression ratios range from 30-80% depending on content. Image-heavy PDFs compress more than text-only PDFs." },
      { question: "Is it safe to compress PDFs online?", answer: "Yes. All processing happens in your browser. Your files never leave your device." },
      { question: "Can I compress a PDF for email?", answer: "Yes. Most email providers limit attachments to 25MB. Our tool can compress large PDFs to under 10MB." },
    ],
  },
  "merge": {
    relatedTools: [
      { title: "Split PDF", description: "Split into separate files", href: "/split", icon: "✂️" },
      { title: "Organize Pages", description: "Reorder PDF pages", href: "/organize", icon: "📑" },
      { title: "Delete Pages", description: "Remove unwanted pages", href: "/delete-pages", icon: "🗑️" },
    ],
    relatedBlogs: [allBlogs["merge"], allBlogs["organize"], allBlogs["split"]],
    faqs: [
      { question: "Can I merge different page sizes?", answer: "Yes. Our merger handles PDFs with different page sizes and orientations, combining them into one document." },
      { question: "Is there a limit on how many files I can merge?", answer: "Free users can merge up to 5 files. Premium users can merge unlimited files in batch." },
      { question: "Does merging reduce quality?", answer: "No. Pages are copied without recompression, preserving original quality." },
    ],
  },
  "split": {
    relatedTools: [
      { title: "Merge PDF", description: "Combine PDFs into one", href: "/merge", icon: "🔗" },
      { title: "Split by Bookmarks", description: "Split by PDF bookmarks", href: "/split-by-bookmarks", icon: "📑" },
      { title: "Delete Pages", description: "Remove specific pages", href: "/delete-pages", icon: "🗑️" },
    ],
    relatedBlogs: [allBlogs["split"], allBlogs["split-by-bookmarks"], allBlogs["organize"]],
    faqs: [
      { question: "Can I split by page ranges?", answer: "Yes. You can specify custom ranges like 1-5, 7, 9-12 to extract specific pages." },
      { question: "Can I split every N pages?", answer: "Yes. The splitter can divide a PDF into chunks of equal page count." },
      { question: "Does split preserve bookmarks?", answer: "Yes. Bookmarks and internal links are preserved in the split output files." },
    ],
  },
  "image-to-pdf": {
    relatedTools: [
      { title: "PDF to Images", description: "Extract pages as images", href: "/pdf-to-images", icon: "📸" },
      { title: "Scan to PDF", description: "Scan documents to PDF", href: "/scan-to-pdf", icon: "📷" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
    ],
    relatedBlogs: [allBlogs["image-to-pdf"], allBlogs["scan-to-pdf"], allBlogs["pdf-to-images"]],
    faqs: [
      { question: "What image formats are supported?", answer: "JPG, PNG, WebP, BMP, GIF, and TIFF are all supported." },
      { question: "Can I combine multiple images into one PDF?", answer: "Yes. Select multiple images and they'll be combined into a single multi-page PDF." },
      { question: "Is there a size limit?", answer: "Free users can convert images up to 10MB total. Premium users get 100MB limit." },
    ],
  },
  "protect": {
    relatedTools: [
      { title: "Unlock PDF", description: "Remove password protection", href: "/unlock", icon: "🔓" },
      { title: "Sign PDF", description: "Add signatures", href: "/sign", icon: "✍️" },
      { title: "Redact PDF", description: "Black out sensitive content", href: "/redact", icon: "⬛" },
    ],
    relatedBlogs: [allBlogs["protect"], allBlogs["unlock"], allBlogs["sign"]],
    faqs: [
      { question: "Can I set different permissions?", answer: "Yes. You can allow or restrict printing, copying, and editing when setting the password." },
      { question: "Is the encryption secure?", answer: "Yes. We use 128-bit AES encryption, the industry standard for PDF protection." },
      { question: "Can I password-protect an already protected PDF?", answer: "You must unlock it first, then re-protect with a new password." },
    ],
  },
  "unlock": {
    relatedTools: [
      { title: "Protect PDF", description: "Add password protection", href: "/protect", icon: "🔒" },
      { title: "Redact PDF", description: "Black out sensitive content", href: "/redact", icon: "⬛" },
      { title: "Metadata Sanitizer", description: "Strip hidden metadata", href: "/metadata-sanitizer", icon: "🧹" },
    ],
    relatedBlogs: [allBlogs["unlock"], allBlogs["protect"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "Can I unlock any PDF?", answer: "Our tool can remove known passwords from owner-protected PDFs. Password-protected files require the password." },
      { question: "Is it legal to unlock a PDF?", answer: "Only unlock PDFs you own or have permission to modify." },
      { question: "Will unlocking affect the content?", answer: "No. Only the security restrictions are removed. Content and formatting remain unchanged." },
    ],
  },
  "sign": {
    relatedTools: [
      { title: "Protect PDF", description: "Add password protection", href: "/protect", icon: "🔒" },
      { title: "Fill PDF Form", description: "Fill form fields", href: "/fill-form", icon: "📋" },
      { title: "Annotate PDF", description: "Highlight and comment", href: "/annotate", icon: "🖍️" },
    ],
    relatedBlogs: [allBlogs["sign"], allBlogs["fill-form"], allBlogs["annotate"]],
    faqs: [
      { question: "Can I save my signature?", answer: "Yes. Your signature is stored locally in your browser for future use." },
      { question: "What signature styles are available?", answer: "You can draw, type, or upload an image of your signature." },
      { question: "Is the signature legally binding?", answer: "Electronic signatures are legally valid in most countries under eSignature laws." },
    ],
  },
  "edit-pdf": {
    relatedTools: [
      { title: "Annotate PDF", description: "Highlight and comment", href: "/annotate", icon: "🖍️" },
      { title: "Fill PDF Form", description: "Fill form fields", href: "/fill-form", icon: "📋" },
      { title: "Watermark PDF", description: "Add text watermarks", href: "/watermark", icon: "💧" },
    ],
    relatedBlogs: [allBlogs["edit-pdf"], allBlogs["annotate"], allBlogs["add-page-numbers"]],
    faqs: [
      { question: "Can I add images to a PDF?", answer: "Yes. You can add text boxes, shapes, drawings, and images." },
      { question: "Does editing preserve existing content?", answer: "Yes. The editor adds new elements on top of existing content without altering it." },
      { question: "Can I change font sizes and colors?", answer: "Yes. Customize font, size, color, and position of added text." },
    ],
  },
  "crop": {
    relatedTools: [
      { title: "Resize PDF", description: "Change page size", href: "/resize", icon: "📐" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
    ],
    relatedBlogs: [allBlogs["crop"], allBlogs["resize"], allBlogs["compress"]],
    faqs: [
      { question: "Can I crop different margins per page?", answer: "Yes. You can set custom margins for each page or apply the same crop to all pages." },
      { question: "Does cropping reduce file size?", answer: "Yes. Removing margins and white space can significantly reduce file size." },
    ],
  },
  "resize": {
    relatedTools: [
      { title: "Crop PDF", description: "Remove margins", href: "/crop", icon: "🔲" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
      { title: "Booklet Creator", description: "Create printable booklets", href: "/booklet", icon: "📖" },
    ],
    relatedBlogs: [allBlogs["resize"], allBlogs["crop"], allBlogs["booklet"]],
    faqs: [
      { question: "What page sizes are available?", answer: "A4, Letter, Legal, A3, A5, Tabloid, and custom dimensions." },
      { question: "Can I resize specific pages only?", answer: "Yes. Select individual pages or apply to all pages." },
    ],
  },
  "annotate": {
    relatedTools: [
      { title: "Edit PDF", description: "Add text and shapes", href: "/edit-pdf", icon: "✏️" },
      { title: "Sign PDF", description: "Add signatures", href: "/sign", icon: "✍️" },
      { title: "Redact PDF", description: "Black out content", href: "/redact", icon: "⬛" },
    ],
    relatedBlogs: [allBlogs["annotate"], allBlogs["edit-pdf"], allBlogs["sign"]],
    faqs: [
      { question: "Can I highlight text?", answer: "Yes. Select the highlight tool and drag over text to highlight, underline, or strikethrough." },
      { question: "Are annotations saved in the PDF?", answer: "Yes. Annotations are embedded directly into the PDF file." },
    ],
  },
  "delete-pages": {
    relatedTools: [
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
      { title: "Split PDF", description: "Split into files", href: "/split", icon: "✂️" },
      { title: "Insert Blank Pages", description: "Add empty pages", href: "/insert-blank", icon: "📄" },
    ],
    relatedBlogs: [allBlogs["delete-pages"], allBlogs["organize"], allBlogs["insert-blank"]],
    faqs: [
      { question: "Can I delete multiple pages at once?", answer: "Yes. Select multiple pages by holding Ctrl/Cmd and clicking." },
      { question: "What happens to the remaining pages?", answer: "They're renumbered automatically in the output PDF." },
    ],
  },
  "organize": {
    relatedTools: [
      { title: "Delete Pages", description: "Remove pages", href: "/delete-pages", icon: "🗑️" },
      { title: "Reverse PDF", description: "Reverse page order", href: "/reverse-pdf", icon: "🔄" },
      { title: "Split PDF", description: "Split into files", href: "/split", icon: "✂️" },
    ],
    relatedBlogs: [allBlogs["organize"], allBlogs["delete-pages"], allBlogs["reverse"]],
    faqs: [
      { question: "Can I drag and drop to reorder?", answer: "Yes. Simply drag pages to their desired position." },
      { question: "Does reorganizing preserve content?", answer: "Yes. Only the page order changes. Content remains intact." },
    ],
  },
  "rotate": {
    relatedTools: [
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
      { title: "Crop PDF", description: "Remove margins", href: "/crop", icon: "🔲" },
      { title: "Reverse PDF", description: "Reverse page order", href: "/reverse-pdf", icon: "🔄" },
    ],
    relatedBlogs: [allBlogs["rotate"], allBlogs["organize"], allBlogs["reverse"]],
    faqs: [
      { question: "What rotation angles are supported?", answer: "90, 180, and 270 degrees clockwise." },
      { question: "Can I rotate individual pages?", answer: "Yes. Select specific pages or apply rotation to the entire document." },
    ],
  },
  "watermark": {
    relatedTools: [
      { title: "Add Page Numbers", description: "Add page numbers", href: "/add-page-numbers", icon: "🔢" },
      { title: "QR Code Stamp", description: "Add QR codes", href: "/qr-stamp", icon: "📱" },
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
    ],
    relatedBlogs: [allBlogs["watermark"], allBlogs["add-page-numbers"], allBlogs["bates-numbering"]],
    faqs: [
      { question: "Can I add multiple watermarks?", answer: "Yes. You can add multiple text watermarks with different content and positions." },
      { question: "What font styles are available?", answer: "Customize font, size, color, opacity, rotation, and position." },
    ],
  },
  "pdf-to-word": {
    relatedTools: [
      { title: "Word to PDF", description: "Convert DOCX to PDF", href: "/word-to-pdf", icon: "📝" },
      { title: "PDF to Excel", description: "Extract tables", href: "/pdf-to-excel", icon: "📊" },
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
    ],
    relatedBlogs: [allBlogs["pdf-to-word"], allBlogs["word-to-pdf"], allBlogs["pdf-to-excel"]],
    faqs: [
      { question: "Is the formatting preserved?", answer: "Our converter preserves layout, fonts, images, and formatting as much as possible." },
      { question: "Can I convert scanned PDFs to Word?", answer: "Use OCR PDF first to extract text, then convert." },
    ],
  },
  "word-to-pdf": {
    relatedTools: [
      { title: "PDF to Word", description: "Convert PDF to DOCX", href: "/pdf-to-word", icon: "📄" },
      { title: "HTML to PDF", description: "Convert HTML to PDF", href: "/html-to-pdf", icon: "🌐" },
      { title: "Text to PDF", description: "Convert text to PDF", href: "/text-to-pdf", icon: "📝" },
    ],
    relatedBlogs: [allBlogs["word-to-pdf"], allBlogs["pdf-to-word"], allBlogs["html-to-pdf"]],
    faqs: [
      { question: "Does it support .docx and .doc?", answer: "Yes. Both .docx and .doc files are supported." },
      { question: "Are images preserved?", answer: "Yes. All images, tables, and formatting are preserved in the output PDF." },
    ],
  },
  "redact": {
    relatedTools: [
      { title: "Search & Redact", description: "Auto-redact words", href: "/search-redact", icon: "⬛" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
      { title: "Protect PDF", description: "Add password protection", href: "/protect", icon: "🔒" },
    ],
    relatedBlogs: [allBlogs["redact"], allBlogs["search-redact"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "Can I undo a redaction?", answer: "No. Redactions are permanent once applied. Always test on a copy first." },
      { question: "What can I redact?", answer: "Text, images, numbers, signatures — any content on any page." },
    ],
  },
  "search-redact": {
    relatedTools: [
      { title: "Redact PDF", description: "Manual area redaction", href: "/redact", icon: "⬛" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
      { title: "PDF Inverter", description: "Invert PDF colors", href: "/pdf-inverter", icon: "🎨" },
    ],
    relatedBlogs: [allBlogs["search-redact"], allBlogs["redact"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "Does it work on scanned PDFs?", answer: "Yes. Scanned PDFs are processed through OCR to detect and redact matching text." },
      { question: "Can I redact multiple terms at once?", answer: "Yes. Enter comma-separated terms to redact all matching occurrences." },
    ],
  },
  "fill-form": {
    relatedTools: [
      { title: "Form Data Extract", description: "Extract form data", href: "/form-data-extract", icon: "📊" },
      { title: "Sign PDF", description: "Add signatures", href: "/sign", icon: "✍️" },
      { title: "Flatten PDF", description: "Flatten form fields", href: "/flatten-pdf", icon: "📄" },
    ],
    relatedBlogs: [allBlogs["fill-form"], allBlogs["form-data-extract"], allBlogs["flatten-pdf"]],
    faqs: [
      { question: "What form fields are supported?", answer: "Text fields, checkboxes, radio buttons, dropdowns, and signature fields." },
      { question: "Can I save and continue later?", answer: "Your filled form data is saved locally in your browser." },
    ],
  },
  "extract-text": {
    relatedTools: [
      { title: "OCR PDF", description: "OCR for scanned PDFs", href: "/ocr-pdf", icon: "🔍" },
      { title: "PDF to Word", description: "Convert to DOCX", href: "/pdf-to-word", icon: "📄" },
      { title: "Chat with PDF", description: "Ask questions", href: "/chat-pdf", icon: "🤖" },
    ],
    relatedBlogs: [allBlogs["extract-text"], allBlogs["ocr-pdf"], allBlogs["chat-pdf"]],
    faqs: [
      { question: "Can I extract text from scanned PDFs?", answer: "Use the OCR PDF tool first to recognize text, then extract." },
      { question: "What languages are supported?", answer: "Our text extractor works with any language encoded in the PDF." },
    ],
  },
  "ocr-pdf": {
    relatedTools: [
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
      { title: "PDF to Word", description: "Convert to DOCX", href: "/pdf-to-word", icon: "📄" },
      { title: "Chat with PDF", description: "Ask questions", href: "/chat-pdf", icon: "🤖" },
    ],
    relatedBlogs: [allBlogs["ocr-pdf"], allBlogs["extract-text"], allBlogs["pdf-to-word"]],
    faqs: [
      { question: "What languages does OCR support?", answer: "English, Spanish, French, German, Portuguese, and 100+ more languages." },
      { question: "How accurate is the OCR?", answer: "Accuracy depends on image quality. Clear scans achieve 99%+ accuracy." },
    ],
  },
  "add-page-numbers": {
    relatedTools: [
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
      { title: "Watermark PDF", description: "Add watermarks", href: "/watermark", icon: "💧" },
      { title: "QR Code Stamp", description: "Add QR codes", href: "/qr-stamp", icon: "📱" },
    ],
    relatedBlogs: [allBlogs["add-page-numbers"], allBlogs["bates-numbering"], allBlogs["watermark"]],
    faqs: [
      { question: "Can I choose number position?", answer: "Yes. Top-left, top-right, bottom-left, bottom-right, or center." },
      { question: "Can I start from a specific number?", answer: "Yes. Set any starting number and choose prefix/suffix text." },
    ],
  },
  "reverse-pdf": {
    relatedTools: [
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
      { title: "Delete Pages", description: "Remove pages", href: "/delete-pages", icon: "🗑️" },
      { title: "Rotate PDF", description: "Rotate pages", href: "/rotate", icon: "🔄" },
    ],
    relatedBlogs: [allBlogs["reverse"], allBlogs["organize"], allBlogs["delete-pages"]],
    faqs: [
      { question: "Does reversing affect content?", answer: "No. Only the page sequence is reversed. Content remains unchanged." },
    ],
  },
  "insert-blank": {
    relatedTools: [
      { title: "Delete Pages", description: "Remove pages", href: "/delete-pages", icon: "🗑️" },
      { title: "Split PDF", description: "Split into files", href: "/split", icon: "✂️" },
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
    ],
    relatedBlogs: [allBlogs["insert-blank"], allBlogs["delete-pages"], allBlogs["organize"]],
    faqs: [
      { question: "What size are blank pages?", answer: "Blank pages match the size of your document's first page." },
      { question: "Can I insert multiple blank pages?", answer: "Yes. Specify the exact number of pages to insert." },
    ],
  },
  "metadata": {
    relatedTools: [
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
      { title: "Protect PDF", description: "Add password protection", href: "/protect", icon: "🔒" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
    ],
    relatedBlogs: [allBlogs["metadata"], allBlogs["metadata-sanitizer"], allBlogs["compress"]],
    faqs: [
      { question: "What metadata can I edit?", answer: "Title, author, subject, keywords, and producer fields." },
      { question: "Does editing metadata affect content?", answer: "No. Metadata changes don't affect the visible content." },
    ],
  },
  "metadata-sanitizer": {
    relatedTools: [
      { title: "Metadata Editor", description: "View and edit metadata", href: "/metadata", icon: "📋" },
      { title: "Redact PDF", description: "Black out content", href: "/redact", icon: "⬛" },
      { title: "Unlock PDF", description: "Remove protection", href: "/unlock", icon: "🔓" },
    ],
    relatedBlogs: [allBlogs["metadata-sanitizer"], allBlogs["metadata"], allBlogs["redact"]],
    faqs: [
      { question: "What metadata is removed?", answer: "Title, author, creator, producer, creation date, modification date, and embedded files." },
      { question: "Is the removal permanent?", answer: "Yes. Once sanitized, the metadata cannot be recovered." },
    ],
  },
  "flatten-pdf": {
    relatedTools: [
      { title: "Fill PDF Form", description: "Fill form fields", href: "/fill-form", icon: "📋" },
      { title: "Form Data Extract", description: "Extract form data", href: "/form-data-extract", icon: "📊" },
      { title: "Redact PDF", description: "Black out content", href: "/redact", icon: "⬛" },
    ],
    relatedBlogs: [allBlogs["flatten-pdf"], allBlogs["fill-form"], allBlogs["form-data-extract"]],
    faqs: [
      { question: "Why flatten a PDF?", answer: "Flattening merges layers, form fields, and annotations into page content. Useful for final distribution." },
      { question: "Can I undo flattening?", answer: "No. Flattening is permanent. Always keep a backup." },
    ],
  },
  "html-to-pdf": {
    relatedTools: [
      { title: "Text to PDF", description: "Convert text to PDF", href: "/text-to-pdf", icon: "📝" },
      { title: "Word to PDF", description: "Convert DOCX to PDF", href: "/word-to-pdf", icon: "📝" },
      { title: "PDF to Word", description: "Convert PDF to DOCX", href: "/pdf-to-word", icon: "📄" },
    ],
    relatedBlogs: [allBlogs["html-to-pdf"], allBlogs["text-to-pdf"], allBlogs["word-to-pdf"]],
    faqs: [
      { question: "What HTML elements are supported?", answer: "Headings, paragraphs, lists, tables, images, links, and inline styles." },
    ],
  },
  "text-to-pdf": {
    relatedTools: [
      { title: "Word to PDF", description: "Convert DOCX to PDF", href: "/word-to-pdf", icon: "📝" },
      { title: "HTML to PDF", description: "Convert HTML to PDF", href: "/html-to-pdf", icon: "🌐" },
      { title: "Word Counter", description: "Count words", href: "/word-counter", icon: "📝" },
    ],
    relatedBlogs: [allBlogs["text-to-pdf"], allBlogs["html-to-pdf"], allBlogs["word-counter"]],
    faqs: [
      { question: "Can I set font and formatting?", answer: "Yes. Choose font, size, alignment, and page margins." },
    ],
  },
  "word-counter": {
    relatedTools: [
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
      { title: "Text to PDF", description: "Convert text to PDF", href: "/text-to-pdf", icon: "📝" },
      { title: "OCR PDF", description: "OCR for scanned PDFs", href: "/ocr-pdf", icon: "🔍" },
    ],
    relatedBlogs: [allBlogs["word-counter"], allBlogs["extract-text"], allBlogs["text-to-pdf"]],
    faqs: [
      { question: "Does it count words in scanned PDFs?", answer: "Use OCR PDF first to extract text, then use Word Counter." },
    ],
  },
  "scan-to-pdf": {
    relatedTools: [
      { title: "Image to PDF", description: "Convert images to PDF", href: "/image-to-pdf", icon: "🖼️" },
      { title: "OCR PDF", description: "Extract text from scans", href: "/ocr-pdf", icon: "🔍" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
    ],
    relatedBlogs: [allBlogs["scan-to-pdf"], allBlogs["image-to-pdf"], allBlogs["ocr-pdf"]],
    faqs: [
      { question: "Does it work on mobile?", answer: "Yes. Use your phone camera to scan documents directly in the browser." },
      { question: "What image quality is recommended?", answer: "300 DPI for text documents, 150 DPI for mixed content." },
    ],
  },
  "pdf-to-excel": {
    relatedTools: [
      { title: "PDF to Word", description: "Convert to DOCX", href: "/pdf-to-word", icon: "📄" },
      { title: "Form Data Extract", description: "Extract form data", href: "/form-data-extract", icon: "📊" },
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
    ],
    relatedBlogs: [allBlogs["pdf-to-excel"], allBlogs["form-data-extract"], allBlogs["pdf-to-word"]],
    faqs: [
      { question: "Does it preserve table formatting?", answer: "Yes. Tables are extracted with their structure and formatting preserved." },
    ],
  },
  "chat-pdf": {
    relatedTools: [
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
      { title: "OCR PDF", description: "OCR for scanned PDFs", href: "/ocr-pdf", icon: "🔍" },
      { title: "PDF to Audio", description: "Listen to PDFs", href: "/pdf-to-audio", icon: "🎧" },
    ],
    relatedBlogs: [allBlogs["chat-pdf"], allBlogs["ocr-pdf"], allBlogs["pdf-to-audio"]],
    faqs: [
      { question: "What AI model is used?", answer: "Gemini API processes your questions and returns answers based on the PDF content." },
      { question: "Are my documents sent to the cloud?", answer: "Text is sent for AI processing. Raw PDF content is never stored." },
    ],
  },
  "pdf-to-audio": {
    relatedTools: [
      { title: "Chat with PDF", description: "Ask questions", href: "/chat-pdf", icon: "🤖" },
      { title: "Extract Text", description: "Extract text content", href: "/extract-text", icon: "📝" },
      { title: "Word Counter", description: "Count words", href: "/word-counter", icon: "📝" },
    ],
    relatedBlogs: [allBlogs["pdf-to-audio"], allBlogs["chat-pdf"], allBlogs["extract-text"]],
    faqs: [
      { question: "What voices are available?", answer: "Multiple voices per language supported through the browser's Speech Synthesis API." },
      { question: "Can I adjust playback speed?", answer: "Yes. Control playback from 0.5x to 2x speed." },
    ],
  },
  "pdf-diff": {
    relatedTools: [
      { title: "Search & Redact", description: "Auto-redact words", href: "/search-redact", icon: "⬛" },
      { title: "PDF Inverter", description: "Invert colors", href: "/pdf-inverter", icon: "🎨" },
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
    ],
    relatedBlogs: [allBlogs["pdf-diff"], allBlogs["search-redact"], allBlogs["pdf-inverter"]],
    faqs: [
      { question: "How does the comparison work?", answer: "Pages are rendered as images and compared side-by-side with differences highlighted." },
      { question: "Can I compare scanned documents?", answer: "Yes. The diff tool works on rendered page images." },
    ],
  },
  "certificate-generator": {
    relatedTools: [
      { title: "Form Data Extract", description: "Extract form data", href: "/form-data-extract", icon: "📊" },
      { title: "Bulk Rename", description: "Rename by metadata", href: "/bulk-rename", icon: "🏷️" },
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
    ],
    relatedBlogs: [allBlogs["certificate-generator"], allBlogs["bulk-rename"], allBlogs["bates-numbering"]],
    faqs: [
      { question: "What CSV format is required?", answer: "First row must be headers matching your template placeholders (e.g., NAME, DATE, COURSE)." },
      { question: "How many certificates can I generate?", answer: "Unlimited. Each row in your CSV generates one certificate." },
    ],
  },
  "form-data-extract": {
    relatedTools: [
      { title: "Fill PDF Form", description: "Fill form fields", href: "/fill-form", icon: "📋" },
      { title: "PDF to Excel", description: "Extract tables", href: "/pdf-to-excel", icon: "📊" },
      { title: "Flatten PDF", description: "Flatten form fields", href: "/flatten-pdf", icon: "📄" },
    ],
    relatedBlogs: [allBlogs["form-data-extract"], allBlogs["fill-form"], allBlogs["pdf-to-excel"]],
    faqs: [
      { question: "What form fields are supported?", answer: "Text fields, checkboxes, radio buttons, dropdowns, and signature fields." },
    ],
  },
  "bulk-rename": {
    relatedTools: [
      { title: "Certificate Generator", description: "Generate certificates", href: "/certificate-generator", icon: "🏆" },
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
      { title: "Split by Bookmarks", description: "Split by bookmarks", href: "/split-by-bookmarks", icon: "📑" },
    ],
    relatedBlogs: [allBlogs["bulk-rename"], allBlogs["bates-numbering"], allBlogs["split-by-bookmarks"]],
    faqs: [
      { question: "What naming patterns are supported?", answer: "Use [TITLE], [AUTHOR], [PAGES], [DATE], and custom text patterns." },
    ],
  },
  "booklet": {
    relatedTools: [
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
      { title: "Resize PDF", description: "Change page size", href: "/resize", icon: "📐" },
    ],
    relatedBlogs: [allBlogs["booklet"], allBlogs["bates-numbering"], allBlogs["resize"]],
    faqs: [
      { question: "What booklet layouts are available?", answer: "Side-by-side, 2x2 grid, 4x4 grid, and custom N-up layouts." },
    ],
  },
  "pdf-inverter": {
    relatedTools: [
      { title: "PDF Diff", description: "Compare PDFs", href: "/pdf-diff", icon: "🔍" },
      { title: "Search & Redact", description: "Auto-redact words", href: "/search-redact", icon: "⬛" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
    ],
    relatedBlogs: [allBlogs["pdf-inverter"], allBlogs["pdf-diff"], allBlogs["search-redact"]],
    faqs: [
      { question: "What color modes are available?", answer: "Dark mode (invert), grayscale, and high-contrast presets." },
    ],
  },
  "vault": {
    relatedTools: [
      { title: "Protect PDF", description: "Add password protection", href: "/protect", icon: "🔒" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
      { title: "Redact PDF", description: "Black out content", href: "/redact", icon: "⬛" },
    ],
    relatedBlogs: [allBlogs["vault"], allBlogs["protect"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "Is the vault encrypted?", answer: "Yes. Documents are encrypted with AES before being stored in your browser's localStorage." },
      { question: "What happens if I clear my browser data?", answer: "Vault contents are stored locally. Clearing browser data will delete them." },
    ],
  },
  "qr-stamp": {
    relatedTools: [
      { title: "Watermark PDF", description: "Add text watermarks", href: "/watermark", icon: "💧" },
      { title: "Add Page Numbers", description: "Add page numbers", href: "/add-page-numbers", icon: "🔢" },
      { title: "Bates Numbering", description: "Sequential numbering", href: "/bates-numbering", icon: "🔢" },
    ],
    relatedBlogs: [allBlogs["qr-stamp"], allBlogs["watermark"], allBlogs["add-page-numbers"]],
    faqs: [
      { question: "Can I customize QR code size?", answer: "Yes. Adjust size from 40px to 200px." },
      { question: "What content can I encode?", answer: "URLs, text, phone numbers, email addresses, and Wi-Fi credentials." },
    ],
  },
  "split-by-bookmarks": {
    relatedTools: [
      { title: "Split PDF", description: "Split by page ranges", href: "/split", icon: "✂️" },
      { title: "Organize Pages", description: "Reorder pages", href: "/organize", icon: "📑" },
      { title: "Delete Pages", description: "Remove pages", href: "/delete-pages", icon: "🗑️" },
    ],
    relatedBlogs: [allBlogs["split-by-bookmarks"], allBlogs["split"], allBlogs["organize"]],
    faqs: [
      { question: "What bookmark structure is supported?", answer: "Nested bookmarks are supported. Each top-level bookmark creates a split." },
    ],
  },
  "bates-numbering": {
    relatedTools: [
      { title: "Add Page Numbers", description: "Add page numbers", href: "/add-page-numbers", icon: "🔢" },
      { title: "Watermark PDF", description: "Add watermarks", href: "/watermark", icon: "💧" },
      { title: "Bulk Rename", description: "Rename by metadata", href: "/bulk-rename", icon: "🏷️" },
    ],
    relatedBlogs: [allBlogs["bates-numbering"], allBlogs["add-page-numbers"], allBlogs["watermark"]],
    faqs: [
      { question: "What is Bates numbering?", answer: "A sequential numbering system used in legal documents to uniquely identify each page." },
    ],
  },
  "pdf-to-images": {
    relatedTools: [
      { title: "Image to PDF", description: "Convert images to PDF", href: "/image-to-pdf", icon: "🖼️" },
      { title: "Scan to PDF", description: "Scan to PDF", href: "/scan-to-pdf", icon: "📷" },
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
    ],
    relatedBlogs: [allBlogs["pdf-to-images"], allBlogs["image-to-pdf"], allBlogs["scan-to-pdf"]],
    faqs: [
      { question: "What image formats are output?", answer: "PNG format with configurable resolution and quality." },
    ],
  },
  "pdf-to-pdfa": {
    relatedTools: [
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
      { title: "Repair PDF", description: "Fix corrupted PDFs", href: "/repair-pdf", icon: "🔧" },
    ],
    relatedBlogs: [allBlogs["pdf-to-pdfa"], allBlogs["compress"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "What is PDF/A?", answer: "PDF/A is an ISO-standardized archive format designed for long-term preservation of electronic documents." },
      { question: "Is PDF/A smaller than regular PDF?", answer: "PDF/A files are typically similar in size. The format prioritizes self-containment and reproducibility over compression." },
    ],
  },
  "batch": {
    relatedTools: [
      { title: "Bulk Rename", description: "Rename by metadata", href: "/bulk-rename", icon: "🏷️" },
      { title: "Certificate Generator", description: "Generate certificates", href: "/certificate-generator", icon: "🏆" },
      { title: "Booklet Creator", description: "Create booklets", href: "/booklet", icon: "📖" },
    ],
    relatedBlogs: [allBlogs["batch"], allBlogs["bulk-rename"], allBlogs["certificate-generator"]],
    faqs: [
      { question: "What batch operations are supported?", answer: "Compress, merge, split, convert — most tools support batch processing with Premium." },
    ],
  },
  "repair-pdf": {
    relatedTools: [
      { title: "Compress PDF", description: "Reduce file size", href: "/compress", icon: "📦" },
      { title: "PDF to PDF/A", description: "Convert to archive format", href: "/pdf-to-pdfa", icon: "📦" },
      { title: "Metadata Sanitizer", description: "Strip metadata", href: "/metadata-sanitizer", icon: "🧹" },
    ],
    relatedBlogs: [allBlogs["pdf-to-pdfa"], allBlogs["compress"], allBlogs["metadata-sanitizer"]],
    faqs: [
      { question: "What types of corruption can be fixed?", answer: "Truncated headers, cross-reference errors, invalid objects, and stream decoding issues." },
      { question: "Can I repair encrypted PDFs?", answer: "You must unlock the PDF first before repair." },
    ],
  },
};

export function getToolSlug(href: string): string {
  return href.replace(/^\//, "").replace(/\//g, "-");
}

export function getRelatedContent(slug: string): ToolRelatedContent | null {
  return relatedContent[slug] || null;
}
