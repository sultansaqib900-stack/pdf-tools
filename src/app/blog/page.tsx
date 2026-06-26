import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      slug: "split-pdf-by-bookmarks",
      title: "How to Split a PDF by Bookmarks — Extract Chapters and Sections",
      excerpt: "Split PDF files automatically using bookmarks and outline structure. Extract chapters, sections, and parts into separate documents.",
      date: "June 26, 2026",
      readTime: "6 min read",
    },
    {
      slug: "bates-numbering-pdf",
      title: "How to Add Bates Numbering to PDF Documents — Sequential Page Labels",
      excerpt: "Add sequential page numbers and custom labels to every page of a PDF. Essential for legal documents, discovery, and indexing.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "compare-pdfs-online",
      title: "How to Compare Two PDF Files Online Free — Spot Differences Instantly",
      excerpt: "Compare two PDF files side by side and spot text differences instantly. Free online PDF comparison with highlighted changes.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "generate-pdf-certificates",
      title: "How to Generate PDF Certificates in Bulk Online Free",
      excerpt: "Create professional PDF certificates in bulk from a template and CSV data. Perfect for course completions, awards, and events.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "convert-pdf-to-audio",
      title: "How to Convert PDF to Audio Online Free — Listen Instead of Read",
      excerpt: "Listen to PDF documents hands-free with text-to-speech conversion. Customizable voice and speed controls.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "extract-pdf-form-data",
      title: "How to Extract PDF Form Data to CSV Online Free",
      excerpt: "Extract form field data from PDF forms and export to CSV for data analysis and record keeping.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "bulk-rename-pdf-files",
      title: "How to Bulk Rename PDF Files by Metadata Online Free",
      excerpt: "Rename multiple PDFs at once using embedded metadata like title, author, and page count.",
      date: "June 26, 2026",
      readTime: "4 min read",
    },
    {
      slug: "create-pdf-booklet",
      title: "How to Create a PDF Booklet for Printing Online Free",
      excerpt: "Convert any PDF into a printable booklet with side-by-side pages and N-up layouts. Save paper and create professional booklets.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "search-and-redact-pdf",
      title: "How to Search and Redact Words in PDF Online Free",
      excerpt: "Automatically find and redact specific words or phrases across your entire PDF document.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "invert-pdf-colors",
      title: "How to Invert PDF Colors Online Free — Dark Mode & High Contrast",
      excerpt: "Convert PDF colors to dark mode, grayscale, or high-contrast for better readability and accessibility.",
      date: "June 26, 2026",
      readTime: "4 min read",
    },
    {
      slug: "secure-pdf-vault",
      title: "How to Store PDFs Securely Online Free — Encrypted Document Vault",
      excerpt: "Store PDFs in an encrypted browser vault with password protection. Access your files securely from anywhere.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "add-qr-code-to-pdf",
      title: "How to Add QR Code to PDF Pages Online Free",
      excerpt: "Add QR codes to every page of your PDF document for tracking, linking, and interactive content.",
      date: "June 26, 2026",
      readTime: "4 min read",
    },
    {
      slug: "clean-pdf-metadata",
      title: "How to Remove Metadata from PDF Online Free — Clean Your Documents",
      excerpt: "Strip hidden metadata including author, dates, software info, and annotations before sharing PDFs.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "split-pdf-pages-online",
      title: "How to Split PDF Pages Online Free — Extract Specific Pages",
      excerpt: "Split PDF files online for free. Extract specific pages or split every page into separate files instantly in your browser. No uploads, no signup.",
      date: "June 26, 2026",
      readTime: "5 min read",
    },
    {
      slug: "sign-pdf-without-printing",
      title: "How to Sign a PDF Without Printing (Free Online e-Sign Tool)",
      excerpt: "Learn how to sign a PDF online free without printing or scanning. Draw your signature and add it to any PDF in seconds, entirely in your browser.",
      date: "June 24, 2026",
      readTime: "5 min read",
    },
    {
      slug: "remove-password-from-pdf",
      title: "How to Remove Password from PDF Files (Free Online Unlock)",
      excerpt: "Remove password protection from PDF files online for free. Unlock protected PDFs instantly in your browser with no uploads required.",
      date: "June 24, 2026",
      readTime: "4 min read",
    },
    {
      slug: "pdf-vs-image",
      title: "PDF vs Image — When to Use Each Format for Your Documents",
      excerpt: "Understanding when to use PDF vs image formats like JPG and PNG. Learn how to convert between formats with our free online tools.",
      date: "June 24, 2026",
      readTime: "6 min read",
    },
    {
      slug: "compress-pdf-without-losing-quality",
      title: "How to Compress a PDF Without Losing Quality (100% Free)",
      excerpt: "Learn how to reduce PDF file size while maintaining quality using free online tools. No uploads, no signup, completely free.",
      date: "June 24, 2026",
      readTime: "4 min read",
    },
    {
      slug: "merge-multiple-pdfs-into-one",
      title: "How to Merge Multiple PDFs Into One Document Online Free",
      excerpt: "Combine several PDF files into a single document without installing software. A complete guide to merging PDFs online.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "delete-pages-from-pdf",
      title: "How to Delete Pages from a PDF Online Free (No Signup)",
      excerpt: "Remove unwanted pages from a PDF document online for free. No signup, no uploads, all in your browser.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "text-to-pdf-converter",
      title: "How to Convert Text to PDF Online Free (No Software Needed)",
      excerpt: "Convert plain text to PDF documents online for free. Create professional PDFs from notes, scripts, or letters in seconds.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "organize-pdf-pages",
      title: "How to Reorder and Organize PDF Pages Online Free",
      excerpt: "Drag and drop to reorder pages in your PDF document. Fix scanned documents, rearrange reports, and organize presentations.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "edit-pdf-metadata",
      title: "How to Edit PDF Metadata Online Free — Title, Author & Keywords",
      excerpt: "Update PDF document properties like title, author, subject, and keywords online for free without uploading files.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "resize-pdf-pages",
      title: "How to Resize PDF Pages Online Free — Change to A4, Letter & Custom Sizes",
      excerpt: "Change page size of PDF documents online for free. Choose A4, Letter, Legal, or enter custom dimensions.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "crop-pdf-margins",
      title: "How to Crop PDF Margins Online Free — Remove Whitespace",
      excerpt: "Remove unwanted margins and whitespace from PDF pages online for free. Clean up scanned documents and presentations.",
      date: "June 24, 2026",
      readTime: "3 min read",
    },
    {
      slug: "fill-pdf-forms-online",
      title: "How to Fill PDF Forms Online Free — Complete Forms Instantly",
      excerpt: "Fill PDF forms online for free without Adobe Acrobat. Complete text fields, checkboxes, and dropdowns instantly in your browser.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
    {
      slug: "flatten-pdf-online",
      title: "How to Flatten a PDF Online Free — Merge Layers & Forms",
      excerpt: "Flatten PDF files online for free. Merge form fields, annotations, and layers into permanent page content, all in your browser.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "reverse-pdf-pages",
      title: "How to Reverse PDF Pages Online Free — Flip Page Order",
      excerpt: "Reverse PDF page order online for free. Flip the entire page sequence of any PDF instantly in your browser.",
      date: "June 25, 2026",
      readTime: "3 min read",
    },
    {
      slug: "chat-with-pdf-ai",
      title: "Chat with PDF – Free AI PDF Assistant Online",
      excerpt: "Upload a PDF and ask AI questions about its content. Free daily limit, no signup, all in your browser.",
      date: "June 26, 2026",
      readTime: "4 min read",
    },
    {
      slug: "add-page-numbers-to-pdf",
      title: "How to Add Page Numbers to PDF Files Online Free",
      excerpt: "Add page numbers to PDF documents online for free. Number pages from any starting position with custom formatting.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "annotate-pdf-online",
      title: "How to Annotate PDF Online Free — Highlight, Comment & Markup",
      excerpt: "Annotate PDF documents online for free. Highlight text, add comments, draw shapes, and markup PDFs instantly in your browser.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
    {
      slug: "batch-process-pdf-online",
      title: "How to Batch Process PDF Files Online Free — Edit Multiple PDFs at Once",
      excerpt: "Batch process multiple PDF files online for free. Apply the same operation to many PDFs at once.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "extract-text-from-pdf",
      title: "How to Extract Text from PDF Online Free — Copy Text Instantly",
      excerpt: "Extract text from PDF files online for free. Copy text from scanned or digital PDFs instantly in your browser.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "convert-html-to-pdf",
      title: "How to Convert HTML to PDF Online Free — Webpage to PDF Converter",
      excerpt: "Convert HTML to PDF online for free. Turn web pages, HTML code, or entire websites into PDF documents instantly.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
    {
      slug: "convert-image-to-pdf",
      title: "How to Convert Images to PDF Online Free — JPG, PNG to PDF",
      excerpt: "Convert images to PDF online for free. Turn JPG, PNG, BMP and other image formats into PDF documents instantly.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "insert-blank-pages-pdf",
      title: "How to Insert Blank Pages into a PDF Online Free",
      excerpt: "Add blank pages to PDF documents online for free. Insert empty pages at any position in your PDF.",
      date: "June 25, 2026",
      readTime: "3 min read",
    },
    {
      slug: "convert-pdf-to-excel",
      title: "How to Convert PDF to Excel Online Free — Extract Tables",
      excerpt: "Convert PDF to Excel online for free. Extract tables and data from PDF files into editable Excel spreadsheets.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
    {
      slug: "convert-pdf-to-images",
      title: "How to Convert PDF to Images Online Free — PDF to JPG/PNG",
      excerpt: "Convert PDF pages to high-quality images online for free. Turn each PDF page into JPG or PNG images instantly.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "protect-pdf-with-password",
      title: "How to Password Protect a PDF Online Free — Secure Your Documents",
      excerpt: "Password protect PDF files online for free. Encrypt your PDF documents with a strong password to prevent unauthorized access.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "redact-pdf-online",
      title: "How to Redact PDF Online Free — Permanently Remove Sensitive Content",
      excerpt: "Redact PDF documents online for free. Permanently remove sensitive text, images, and information from PDFs.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
    {
      slug: "add-watermark-to-pdf",
      title: "How to Add Watermark to PDF Online Free — Text & Image Watermarks",
      excerpt: "Add watermarks to PDF documents online for free. Apply text or image watermarks to protect your documents.",
      date: "June 25, 2026",
      readTime: "4 min read",
    },
    {
      slug: "word-counter-online",
      title: "Word Counter Online — Free Character & Word Count Tool",
      excerpt: "Count words, characters, sentences, and paragraphs online for free. A fast word counter tool that works entirely in your browser.",
      date: "June 25, 2026",
      readTime: "3 min read",
    },
    {
      slug: "rotate-pdf-pages-online",
      title: "How to Rotate PDF Pages Online Free — Fix Upside-Down Documents",
      excerpt: "Fix upside-down or sideways PDF pages by rotating 90, 180, or 270 degrees. Free online PDF rotator, no uploads.",
      date: "June 25, 2026",
      readTime: "3 min read",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Blog</h1>
      <p className="text-[var(--muted)] mb-10">Tips, guides, and updates about PDF tools.</p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border border-[var(--card-border)] rounded-xl p-6 bg-[var(--card)] hover:border-indigo-500/30 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-indigo-500">{post.title}</h2>
            <p className="text-sm text-[var(--muted)] mt-2">{post.excerpt}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-[var(--muted)]">
              <span>{post.date}</span>
              <span>&middot;</span>
              <span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
