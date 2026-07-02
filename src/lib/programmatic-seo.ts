export interface SeoPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  toolSlug: string | null;
  toolName: string;
  audience: string;
  painPoint: string;
  benefit: string;
  faqs: { question: string; answer: string }[];
}

const topTools = [
  { slug: "compress", name: "Compress PDF", emoji: "📦" },
  { slug: "merge", name: "Merge PDF", emoji: "🔗" },
  { slug: "split", name: "Split PDF", emoji: "✂️" },
  { slug: "image-to-pdf", name: "Image to PDF", emoji: "🖼️" },
  { slug: "edit-pdf", name: "Edit PDF", emoji: "✏️" },
  { slug: "protect", name: "Protect PDF", emoji: "🔒" },
  { slug: "sign", name: "Sign PDF", emoji: "✍️" },
  { slug: "pdf-to-word", name: "PDF to Word", emoji: "📄" },
  { slug: "ocr-pdf", name: "OCR PDF", emoji: "🔍" },
  { slug: "unlock", name: "Unlock PDF", emoji: "🔓" },
  { slug: "rotate", name: "Rotate PDF", emoji: "🔄" },
  { slug: "delete-pages", name: "Delete Pages", emoji: "🗑️" },
  { slug: "organize", name: "Organize Pages", emoji: "📋" },
  { slug: "annotate", name: "Annotate PDF", emoji: "💬" },
  { slug: "add-page-numbers", name: "Add Page Numbers", emoji: "🔢" },
  { slug: "redact", name: "Redact PDF", emoji: "⬛" },
  { slug: "extract-text", name: "Extract Text", emoji: "📃" },
  { slug: "watermark", name: "Watermark PDF", emoji: "💧" },
  { slug: "crop", name: "Crop PDF", emoji: "✂️" },
  { slug: "fill-form", name: "Fill PDF Form", emoji: "📋" },
];

const useCases = [
  {
    audience: "college-students",
    label: "for College Students",
    painPoints: [
      "submitting assignments that exceed file size limits",
      "combining multiple scanned lecture notes into one PDF",
      "extracting specific chapters from digital textbooks",
    ],
    benefit: "get your work done fast without paying for expensive software",
  },
  {
    audience: "high-school-students",
    label: "for High School Students",
    painPoints: [
      "reducing PDF size for email submissions to teachers",
      "converting images of handwritten notes into PDF",
      "merging project files into a single document",
    ],
    benefit: "finish your school projects quickly with free tools",
  },
  {
    audience: "teachers",
    label: "for Teachers",
    painPoints: [
      "splitting large exam PDFs into individual worksheets",
      "protecting test answer keys with passwords",
      "combining student submissions into one file",
    ],
    benefit: "save hours of document prep time every week",
  },
  {
    audience: "office-workers",
    label: "for Office Workers",
    painPoints: [
      "reducing PDF size for email attachments",
      "converting scanned contracts to searchable text",
      "merging multiple report sections into one PDF",
    ],
    benefit: "process documents faster without IT support",
  },
  {
    audience: "freelancers",
    label: "for Freelancers",
    painPoints: [
      "sending professional signed PDF proposals",
      "compressing portfolio PDFs for client email",
      "editing invoices without expensive Adobe software",
    ],
    benefit: "look professional without monthly software fees",
  },
  {
    audience: "small-business-owners",
    label: "for Small Business Owners",
    painPoints: [
      "protecting financial documents with passwords",
      "merging invoices and receipts for accounting",
      "converting business documents to fillable forms",
    ],
    benefit: "run your business paperwork without expensive tools",
  },
  {
    audience: "job-seekers",
    label: "for Job Seekers",
    painPoints: [
      "compressing resume PDFs for online applications",
      "merging cover letter and resume into one file",
      "redacting personal info from old documents",
    ],
    benefit: "submit professional applications every time",
  },
  {
    audience: "recruiters",
    label: "for Recruiters",
    painPoints: [
      "combining multiple candidate resumes into one PDF",
      "redacting confidential candidate information",
      "annotating resumes for team review",
    ],
    benefit: "streamline your hiring workflow entirely for free",
  },
  {
    audience: "researchers",
    label: "for Researchers",
    painPoints: [
      "extracting text from scanned research papers",
      "merging literature review PDFs into one document",
      "adding page numbers to long research manuscripts",
    ],
    benefit: "organize your research without expensive reference managers",
  },
  {
    audience: "lawyers",
    label: "for Lawyers",
    painPoints: [
      "redacting confidential client information from documents",
      "merging multiple case file PDFs into organized bundles",
      "protecting sensitive legal documents with passwords",
    ],
    benefit: "handle confidential documents safely and free of charge",
  },
  {
    audience: "accountants",
    label: "for Accountants",
    painPoints: [
      "converting PDF financial statements to Excel",
      "protecting client tax documents with encryption",
      "merging quarterly reports into annual summaries",
    ],
    benefit: "process financial documents faster without paid tools",
  },
  {
    audience: "healthcare-workers",
    label: "for Healthcare Workers",
    painPoints: [
      "redacting patient information from medical records",
      "converting healthcare forms to fillable PDFs",
      "protecting sensitive patient documents",
    ],
    benefit: "handle medical documents securely at no cost",
  },
  {
    audience: "real-estate-agents",
    label: "for Real Estate Agents",
    painPoints: [
      "merging property documents into listing packages",
      "adding digital signatures to contracts remotely",
      "compressing large property photo PDFs for email",
    ],
    benefit: "close deals faster without paperwork delays",
  },
  {
    audience: "students-abroad",
    label: "for International Students",
    painPoints: [
      "compressing visa application documents for upload",
      "merging admission letter PDFs with financial documents",
      "converting scanned transcripts to searchable PDFs",
    ],
    benefit: "manage your study abroad paperwork entirely for free",
  },
  {
    audience: "remote-workers",
    label: "for Remote Workers",
    painPoints: [
      "signing digital contracts from anywhere",
      "compressing large document scans for Slack uploads",
      "annotating PDFs during virtual team reviews",
    ],
    benefit: "stay productive working from anywhere without extra tools",
  },
];

const toolUseCaseFaqs: Record<string, { question: string; answer: string }[]> = {
  compress: [
    { question: "How much can I compress a PDF?", answer: "Most PDFs compress 40-80%. Image-heavy files compress the most. Text-only PDFs see smaller reductions." },
    { question: "Does compression reduce quality?", answer: "The tool balances size and quality. For text PDFs, quality stays nearly identical. For image-heavy PDFs, there's a slight resolution trade-off." },
    { question: "Is it safe to upload my PDF?", answer: "Nothing is uploaded. All processing happens locally in your browser using WebAssembly. Your files never leave your device." },
  ],
  merge: [
    { question: "How many PDFs can I merge at once?", answer: "Free tier supports 3 files. Premium supports up to 20 files in a single batch." },
    { question: "Does merging change the file order?", answer: "You can drag and drop files to reorder them before merging. The tool preserves your exact order." },
    { question: "Will merged PDFs keep my formatting?", answer: "Yes. Each PDF keeps its original formatting, fonts, and layout. Nothing is flattened or altered." },
  ],
  split: [
    { question: "Can I split by page range?", answer: "Yes. Enter custom page ranges like 1-5, 8, 11-15 to extract specific pages." },
    { question: "Does splitting create separate files?", answer: "Each split extracts pages into a new download. You get separate files for each range you select." },
    { question: "Is there a page limit?", answer: "Free tier handles documents up to 50 pages. Premium has no limit." },
  ],
};

const generalToolFaqs: Record<string, { question: string; answer: string }[]> = {
  "image-to-pdf": [
    { question: "What image formats are supported?", answer: "JPG, PNG, WEBP, BMP, TIFF, and GIF are all supported. You can upload multiple images at once." },
    { question: "Can I combine images into one PDF?", answer: "Yes. Upload multiple images and they'll be combined into a single PDF document in your chosen order." },
  ],
  "edit-pdf": [
    { question: "Can I edit text in a PDF?", answer: "You can add new text, shapes, and highlights. Existing text editing is limited — for deep edits, use our PDF to Word converter first." },
    { question: "Is the editing free?", answer: "Basic text and shape additions are free. Advanced editing features require premium." },
  ],
  protect: [
    { question: "How secure is the encryption?", answer: "The tool uses AES-256 encryption applied client-side. Your file never leaves your browser." },
    { question: "Can I remove protection later?", answer: "Yes, use the Unlock PDF tool with your password to remove protection." },
  ],
};

const generalFaqs = [
  { question: "Is this really free?", answer: "Yes. All tools have a free tier with daily usage limits. Premium unlocks unlimited access and exclusive tools." },
  { question: "Do you store my files?", answer: "No. All processing happens in your browser. Files are never uploaded to any server." },
  { question: "What is the file size limit?", answer: "Free tier supports up to 10MB. Premium supports up to 100MB." },
  { question: "Do I need to create an account?", answer: "No account needed for basic tools. An account lets you sync premium across devices." },
];

function getFaqs(toolSlug: string | null): { question: string; answer: string }[] {
  if (!toolSlug) return generalFaqs;
  return toolUseCaseFaqs[toolSlug] || generalToolFaqs[toolSlug] || generalFaqs;
}

function generateSlug(toolSlug: string, audience: string): string {
  const toolName = topTools.find((t) => t.slug === toolSlug)?.name.toLowerCase().replace(/\s+/g, "-") || toolSlug;
  return `${toolName}-${audience}`;
}

export function getAllSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  for (const tool of topTools) {
    for (const uc of useCases) {
      const slug = generateSlug(tool.slug, uc.audience);
      const toolName = tool.name;
      const audienceLabel = uc.label.replace("for ", "");
      const painPoint = uc.painPoints[Math.floor(Math.random() * uc.painPoints.length)];
      const faqs = getFaqs(tool.slug);
      const siteName = "PDFTools";

      pages.push({
        slug,
        title: `${toolName} ${uc.label} — Free Online Tool | ${siteName}`,
        description: `Free ${toolName.toLowerCase()} tool ${uc.label}. ${uc.benefit}. ${painPoint}. No uploads, no signup, 100% free.`,
        h1: `${toolName} Online — Free Tool ${uc.label}`,
        toolSlug: tool.slug,
        toolName: toolName,
        audience: uc.label,
        painPoint,
        benefit: uc.benefit,
        faqs: faqs.slice(0, 3),
      });
    }
  }

  return pages;
}

export const seoPages = getAllSeoPages();
