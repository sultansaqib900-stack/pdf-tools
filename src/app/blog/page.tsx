import Link from "next/link";

export default function BlogPage() {
  const posts = [
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
