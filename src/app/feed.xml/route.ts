const BASE = "https://allaboutpdfediting.xyz";

const posts = [
  { slug: "how-to-compress-pdf", title: "How to Compress a PDF — Reduce PDF File Size Online Free", excerpt: "Learn how to compress PDF files online free. Reduce PDF size from 20MB to under 5MB with no quality loss. No signup, no uploads.", date: "2026-06-27" },
  { slug: "how-to-merge-pdf", title: "How to Merge PDFs Online Free — Combine Multiple PDFs Into One", excerpt: "Learn how to merge PDF files online free. Combine multiple PDFs into one document in seconds.", date: "2026-06-27" },
  { slug: "how-to-convert-image-to-pdf", title: "How to Convert Images to PDF — JPG, PNG to PDF Online Free", excerpt: "Learn how to convert images to PDF online free. Convert JPG, PNG, WebP images to PDF documents.", date: "2026-06-27" },
  { slug: "ai-pdf-summarization", title: "How to Summarize PDFs with AI — Free Online PDF Summary Tool", excerpt: "Learn how to use AI to summarize PDF documents online free. Extract key points, generate summaries, and save hours of reading time.", date: "2026-06-27" },
  { slug: "google-drive-pdf-editor", title: "How to Edit PDFs from Google Drive — Free Online PDF Editor", excerpt: "Edit PDFs stored in Google Drive directly from your browser. No downloads, no uploads to third-party servers.", date: "2026-06-27" },
  { slug: "automate-pdf-workflow", title: "How to Automate PDF Workflows — Batch Processing & Automation", excerpt: "Learn how to automate PDF processing workflows. Batch compress, watermark, merge, and rename PDFs automatically.", date: "2026-06-27" },
  { slug: "scan-to-pdf", title: "How to Scan Documents to PDF Using Your Camera Online Free", excerpt: "Scan documents to PDF using your device camera. Capture receipts, contracts, and notes and convert them instantly to PDF.", date: "2026-06-27" },
  { slug: "ocr-pdf-online", title: "OCR PDF Online Free — Extract Text from Scanned PDFs", excerpt: "Extract text from scanned PDFs and images using free online OCR. Make scanned documents searchable and editable.", date: "2026-06-27" },
  { slug: "edit-pdf-online", title: "Edit PDF Online Free — Add Text and Shapes to Any PDF", excerpt: "Edit PDF files online for free. Add text boxes, rectangles, circles, and lines to any PDF without installing software.", date: "2026-06-27" },
  { slug: "convert-pdf-to-word", title: "Convert PDF to Word Online Free — PDF to DOCX Converter", excerpt: "Convert PDF to editable Word DOCX files online free. Extract text from PDF documents and download as Microsoft Word format.", date: "2026-06-27" },
  { slug: "convert-word-to-pdf", title: "Convert Word to PDF Online Free — DOCX to PDF Converter", excerpt: "Convert Word DOCX documents to PDF online free. Turn your Word files into professional PDFs instantly.", date: "2026-06-27" },
  { slug: "repair-pdf-online", title: "Repair PDF Online Free — Fix Corrupted PDF Files", excerpt: "Fix corrupted or damaged PDF files online free. Rebuild PDF structure and recover your documents.", date: "2026-06-27" },
  { slug: "convert-pdf-to-pdfa", title: "Convert PDF to PDF/A Online Free — Archive Format Converter", excerpt: "Convert PDF to PDF/A archive format for long-term preservation. Ensure your documents remain readable for decades.", date: "2026-06-27" },
  { slug: "split-pdf-by-bookmarks", title: "How to Split a PDF by Bookmarks — Extract Chapters and Sections", excerpt: "Split PDF files automatically using bookmarks and outline structure. Extract chapters, sections, and parts into separate documents.", date: "2026-06-26" },
  { slug: "bates-numbering-pdf", title: "How to Add Bates Numbering to PDF Documents — Sequential Page Labels", excerpt: "Add sequential page numbers and custom labels to every page of a PDF. Essential for legal documents, discovery, and indexing.", date: "2026-06-26" },
  { slug: "compare-pdfs-online", title: "How to Compare Two PDF Files Online Free — Spot Differences Instantly", excerpt: "Compare two PDF files side by side and spot text differences instantly. Free online PDF comparison with highlighted changes.", date: "2026-06-26" },
  { slug: "generate-pdf-certificates", title: "How to Generate PDF Certificates in Bulk Online Free", excerpt: "Create professional PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and events.", date: "2026-06-26" },
  { slug: "convert-pdf-to-audio", title: "How to Convert PDF to Audio Online Free — Listen Instead of Read", excerpt: "Listen to PDF documents hands-free with text-to-speech conversion. Customizable voice and speed controls.", date: "2026-06-26" },
  { slug: "extract-pdf-form-data", title: "How to Extract PDF Form Data to CSV Online Free", excerpt: "Extract form field data from PDF forms and export to CSV for data analysis and record keeping.", date: "2026-06-26" },
  { slug: "bulk-rename-pdf-files", title: "How to Bulk Rename PDF Files by Metadata Online Free", excerpt: "Rename multiple PDFs at once using embedded metadata like title, author, and page count.", date: "2026-06-26" },
  { slug: "create-pdf-booklet", title: "How to Create a PDF Booklet for Printing Online Free", excerpt: "Convert any PDF into a printable booklet with side-by-side pages and N-up layouts. Save paper and create professional booklets.", date: "2026-06-26" },
  { slug: "search-and-redact-pdf", title: "How to Search and Redact Words in PDF Online Free", excerpt: "Automatically find and redact specific words or phrases across your entire PDF document.", date: "2026-06-26" },
  { slug: "invert-pdf-colors", title: "How to Invert PDF Colors Online Free — Dark Mode & High Contrast", excerpt: "Convert PDF colors to dark mode, grayscale, or high-contrast for better readability and accessibility.", date: "2026-06-26" },
  { slug: "secure-pdf-vault", title: "How to Store PDFs Securely Online Free — Encrypted Document Vault", excerpt: "Store PDFs in an encrypted browser vault with password protection. Access your files securely from anywhere.", date: "2026-06-26" },
  { slug: "add-qr-code-to-pdf", title: "How to Add QR Code to PDF Pages Online Free", excerpt: "Add QR codes to every page of your PDF document for tracking, linking, and interactive content.", date: "2026-06-26" },
  { slug: "clean-pdf-metadata", title: "How to Remove Metadata from PDF Online Free — Clean Your Documents", excerpt: "Strip hidden metadata including author, dates, software info, and annotations before sharing PDFs.", date: "2026-06-26" },
  { slug: "split-pdf-pages-online", title: "How to Split PDF Pages Online Free — Extract Specific Pages", excerpt: "Split PDF files online for free. Extract specific pages or split every page into separate files instantly in your browser. No uploads, no signup.", date: "2026-06-26" },
  { slug: "sign-pdf-without-printing", title: "How to Sign a PDF Without Printing (Free Online e-Sign Tool)", excerpt: "Learn how to sign a PDF online free without printing or scanning. Draw your signature and add it to any PDF in seconds, entirely in your browser.", date: "2026-06-24" },
  { slug: "remove-password-from-pdf", title: "How to Remove Password from PDF Files (Free Online Unlock)", excerpt: "Remove password protection from PDF files online for free. Unlock protected PDFs instantly in your browser with no uploads required.", date: "2026-06-24" },
  { slug: "pdf-vs-image", title: "PDF vs Image — When to Use Each Format for Your Documents", excerpt: "Understanding when to use PDF vs image formats like JPG and PNG. Learn how to convert between formats with our free online tools.", date: "2026-06-24" },
  { slug: "compress-pdf-without-losing-quality", title: "How to Compress a PDF Without Losing Quality (100% Free)", excerpt: "Learn how to reduce PDF file size while maintaining quality using free online tools. No uploads, no signup, completely free.", date: "2026-06-24" },
  { slug: "merge-multiple-pdfs-into-one", title: "How to Merge Multiple PDFs Into One Document Online Free", excerpt: "Combine several PDF files into a single document without installing software. A complete guide to merging PDFs online.", date: "2026-06-24" },
  { slug: "delete-pages-from-pdf", title: "How to Delete Pages from a PDF Online Free (No Signup)", excerpt: "Remove unwanted pages from a PDF document online for free. No signup, no uploads, all in your browser.", date: "2026-06-24" },
  { slug: "text-to-pdf-converter", title: "How to Convert Text to PDF Online Free (No Software Needed)", excerpt: "Convert plain text to PDF documents online for free. Create professional PDFs from notes, scripts, or letters in seconds.", date: "2026-06-24" },
  { slug: "organize-pdf-pages", title: "How to Reorder and Organize PDF Pages Online Free", excerpt: "Drag and drop to reorder pages in your PDF document. Fix scanned documents, rearrange reports, and organize presentations.", date: "2026-06-24" },
  { slug: "edit-pdf-metadata", title: "How to Edit PDF Metadata Online Free — Title, Author & Keywords", excerpt: "Update PDF document properties like title, author, subject, and keywords online for free without uploading files.", date: "2026-06-24" },
  { slug: "resize-pdf-pages", title: "How to Resize PDF Pages Online Free — Change to A4, Letter & Custom Sizes", excerpt: "Change page size of PDF documents online for free. Choose A4, Letter, Legal, or enter custom dimensions.", date: "2026-06-24" },
  { slug: "crop-pdf-margins", title: "How to Crop PDF Margins Online Free — Remove Whitespace", excerpt: "Remove unwanted margins and whitespace from PDF pages online for free. Clean up scanned documents and presentations.", date: "2026-06-24" },
  { slug: "fill-pdf-forms-online", title: "How to Fill PDF Forms Online Free — Complete Forms Instantly", excerpt: "Fill PDF forms online for free without Adobe Acrobat. Complete text fields, checkboxes, and dropdowns instantly in your browser.", date: "2026-06-25" },
  { slug: "flatten-pdf-online", title: "How to Flatten a PDF Online Free — Merge Layers & Forms", excerpt: "Flatten PDF files online for free. Merge form fields, annotations, and layers into permanent page content, all in your browser.", date: "2026-06-25" },
  { slug: "reverse-pdf-pages", title: "How to Reverse PDF Pages Online Free — Flip Page Order", excerpt: "Reverse PDF page order online for free. Flip the entire page sequence of any PDF instantly in your browser.", date: "2026-06-25" },
  { slug: "chat-with-pdf-ai", title: "Chat with PDF – Free AI PDF Assistant Online", excerpt: "Upload a PDF and ask AI questions about its content. Free daily limit, no signup, all in your browser.", date: "2026-06-26" },
  { slug: "add-page-numbers-to-pdf", title: "How to Add Page Numbers to PDF Files Online Free", excerpt: "Add page numbers to PDF documents online for free. Number pages from any starting position with custom formatting.", date: "2026-06-25" },
  { slug: "annotate-pdf-online", title: "How to Annotate PDF Online Free — Highlight, Comment & Markup", excerpt: "Annotate PDF documents online for free. Highlight text, add comments, draw shapes, and markup PDFs instantly in your browser.", date: "2026-06-25" },
  { slug: "batch-process-pdf-online", title: "How to Batch Process PDF Files Online Free — Edit Multiple PDFs at Once", excerpt: "Batch process multiple PDF files online for free. Apply the same operation to many PDFs at once.", date: "2026-06-25" },
  { slug: "extract-text-from-pdf", title: "How to Extract Text from PDF Online Free — Copy Text Instantly", excerpt: "Extract text from PDF files online for free. Copy text from scanned or digital PDFs instantly in your browser.", date: "2026-06-25" },
  { slug: "convert-html-to-pdf", title: "How to Convert HTML to PDF Online Free — Webpage to PDF Converter", excerpt: "Convert HTML to PDF online for free. Turn web pages, HTML code, or entire websites into PDF documents instantly.", date: "2026-06-25" },
  { slug: "convert-image-to-pdf", title: "How to Convert Images to PDF Online Free — JPG, PNG to PDF", excerpt: "Convert images to PDF online for free. Turn JPG, PNG, BMP and other image formats into PDF documents instantly.", date: "2026-06-25" },
  { slug: "insert-blank-pages-pdf", title: "How to Insert Blank Pages into a PDF Online Free", excerpt: "Add blank pages to PDF documents online for free. Insert empty pages at any position in your PDF.", date: "2026-06-25" },
  { slug: "convert-pdf-to-excel", title: "How to Convert PDF to Excel Online Free — Extract Tables", excerpt: "Convert PDF to Excel online for free. Extract tables and data from PDF files into editable Excel spreadsheets.", date: "2026-06-25" },
  { slug: "convert-pdf-to-images", title: "How to Convert PDF to Images Online Free — PDF to JPG/PNG", excerpt: "Convert PDF pages to high-quality images online for free. Turn each PDF page into JPG or PNG images instantly.", date: "2026-06-25" },
  { slug: "protect-pdf-with-password", title: "How to Password Protect a PDF Online Free — Secure Your Documents", excerpt: "Password protect PDF files online for free. Encrypt your PDF documents with a strong password to prevent unauthorized access.", date: "2026-06-25" },
  { slug: "redact-pdf-online", title: "How to Redact PDF Online Free — Permanently Remove Sensitive Content", excerpt: "Redact PDF documents online for free. Permanently remove sensitive text, images, and information from PDFs.", date: "2026-06-25" },
  { slug: "add-watermark-to-pdf", title: "How to Add Watermark to PDF Online Free — Text & Image Watermarks", excerpt: "Add watermarks to PDF documents online for free. Apply text or image watermarks to protect your documents.", date: "2026-06-25" },
  { slug: "word-counter-online", title: "Word Counter Online — Free Character & Word Count Tool", excerpt: "Count words, characters, sentences, and paragraphs online for free. A fast word counter tool that works entirely in your browser.", date: "2026-06-25" },
  { slug: "rotate-pdf-pages-online", title: "How to Rotate PDF Pages Online Free — Fix Upside-Down Documents", excerpt: "Fix upside-down or sideways PDF pages by rotating 90, 180, or 270 degrees. Free online PDF rotator, no uploads.", date: "2026-06-25" },
];

export async function GET() {
  const items = posts.map((p) => `
    <item>
      <title>${escXml(p.title)}</title>
      <link>${BASE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${p.slug}</guid>
      <description>${escXml(p.excerpt)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>PDFTools Blog — Free PDF Guides & Tips</title>
    <link>${BASE}/blog</link>
    <description>Free PDF tutorials, guides, and tips. Learn how to compress, merge, edit, convert, and protect PDFs online for free.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
