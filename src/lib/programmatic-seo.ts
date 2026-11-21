/**
 * Programmatic "Use Case by Audience" pages (`/for/<tool>-<audience>`).
 *
 * Every page combines ONE tool with ONE audience. To avoid doorway-page
 * thinness each combination is generated from:
 *   - a profession profile (`audiences`) holding document examples, a weekly
 *     workflow, compliance caveats and five profession-specific FAQs, and
 *   - a tool profile (`toolProfiles`) holding the realistic outcome, the
 *     practical steps and tool-specific guidance.
 *
 * The generator then produces four distinct, combination-specific blocks
 * (workflow, document examples, tips, FAQs) so no two pages read the same.
 * `src/__tests__/programmaticSeo.test.ts` enforces uniqueness of the rendered
 * copy for every page in the matrix.
 */

export interface SeoFaq {
  question: string;
  answer: string;
}

export interface AudienceProfile {
  slug: string;
  /** Display label including the preposition, e.g. "for College Students". */
  label: string;
  /** Short profession noun used mid-sentence, e.g. "college students". */
  noun: string;
  /** 3 concrete document types this profession actually handles. */
  documents: [string, string, string];
  /** A realistic weekly routine, written as a single sentence. */
  workflow: string;
  /** Profession-specific caution that shows real domain knowledge. */
  caveat: string;
  /** 2 practical, non-generic tips for this profession. */
  tips: [string, string];
  /** 2 profession-specific FAQs (the tool supplies the third). */
  faqs: [SeoFaq, SeoFaq];
}

export interface ToolProfile {
  slug: string;
  name: string;
  /** Realistic, honest description of what the tool produces. */
  outcome: string;
  /** 3 practical steps for this tool. */
  steps: [string, string, string];
  /** One-sentence framing of the problem this tool solves. */
  situation: string;
  /** Tool-specific tip that applies to every audience. */
  tip: string;
  /** One tool-level FAQ appended to the profession FAQs. */
  faq: SeoFaq;
}

export interface SeoPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  toolSlug: string | null;
  toolName: string;
  audience: string;
  painPoint: string;
  painPoints: string[];
  benefit: string;
  faqs: SeoFaq[];
  /** Combination-specific blocks rendered by `/for/[slug]`. */
  workflow: string;
  steps: string[];
  examples: string[];
  tips: string[];
  caveat: string;
}

export const toolProfiles: Record<string, ToolProfile> = {
  compress: {
    slug: "compress",
    situation: "Upload limits force the decision: which copy of this document gets compressed, and how much detail can it lose?",
    name: "Compress PDF",
    outcome: "a smaller PDF that keeps the pages readable at normal zoom",
    steps: [
      "Open Compress PDF and drop in the file — it stays in your browser",
      "Run Balanced first; only try Maximum when the size target is strict",
      "Compare the downloaded copy against the original before you submit it",
    ],
    tip: "Compression is lossy for image-heavy pages: check small print, signatures, and stamps at 100% zoom before sending the file anywhere.",
    faq: {
      question: "Does compressing a PDF remove its text?",
      answer:
        "Lossless mode keeps selectable text and form fields. Balanced and Maximum rebuild pages as optimised images, which flattens selectable text — so use those modes only on the copy you intend to submit.",
    },
  },
  merge: {
    slug: "merge",
    situation: "The document only makes sense as one file, but it currently lives as several separate attachments nobody can follow.",
    name: "Merge PDF",
    outcome: "one combined PDF whose pages keep their original fonts, images, and orientation",
    steps: [
      "Open Merge PDF and add every file you need in the final order",
      "Drag the file list to fix the sequence before merging",
      "Download the single PDF and confirm page counts match the sources",
    ],
    tip: "Merge before you compress. Compressing once at the end gives a smaller combined file than compressing each part and merging afterwards.",
    faq: {
      question: "Does merging change page size or orientation?",
      answer:
        "No. Each page keeps its original dimensions and rotation, so a mixed set of A4 and Letter pages stays mixed. Standardise sizes first with Resize PDF if the print shop requires uniformity.",
    },
  },
  split: {
    slug: "split",
    situation: "The recipient needs one section, not the whole file, and sending everything leaks material they should not receive.",
    name: "Split PDF",
    outcome: "separate documents extracted from the page ranges you choose",
    steps: [
      "Open Split PDF and load the source document",
      "Enter ranges such as 1-4, 7, 12-18 to match your sections",
      "Download single files or the ZIP when you split into many parts",
    ],
    tip: "Keep a copy of the original before splitting into many files — reassembling a scattered set is far harder than re-splitting a whole one.",
    faq: {
      question: "Can I split one PDF into individual pages?",
      answer:
        "Yes. Split every page into its own file and download the batch as a ZIP. Files are generated locally, so nothing is uploaded while the split runs.",
    },
  },
  "image-to-pdf": {
    slug: "image-to-pdf",
    situation: "The source material is a set of photos and screenshots, not a document, and it has to arrive as one tidy file.",
    name: "Image to PDF",
    outcome: "a single PDF with one image per page, in the order you set",
    steps: [
      "Open Image to PDF and select photos or screenshots in sequence",
      "Reorder the thumbnails so the pages read correctly",
      "Download the PDF and confirm nothing is cropped or rotated",
    ],
    tip: "Shoot documents straight on with even lighting. A skewed photo becomes a skewed page, and no converter can straighten perspective for you.",
    faq: {
      question: "What image formats can I combine?",
      answer:
        "JPEG, PNG, and WebP are all accepted, and they can be mixed in one document. Very large phone photos are the usual reason a resulting PDF is bigger than expected.",
    },
  },
  "edit-pdf": {
    slug: "edit-pdf",
    situation: "A field, date, or note is missing from an otherwise finished page, and the original source file is no longer available.",
    name: "Edit PDF",
    outcome: "a flattened PDF with your text boxes, shapes, and markup burned onto the page",
    steps: [
      "Open Edit PDF and pick the page you need to change",
      "Add text, rectangles, or lines and drag them into position",
      "Download the flattened copy — the original stays untouched",
    ],
    tip: "Overlay text rather than trying to erase it. If a whole paragraph must change, convert to Word, edit there, and re-export as PDF.",
    faq: {
      question: "Can I edit the existing text inside a PDF?",
      answer:
        "Not directly. Edit PDF adds new text and shapes on top of the page. To rewrite existing sentences, use PDF to Word, make the edits in a word processor, then convert back.",
    },
  },
  protect: {
    slug: "protect",
    situation: "The file is ready to leave the organisation, but only after access is restricted to the people holding a password.",
    name: "Password Protect",
    outcome: "an AES-256 encrypted PDF that requires the password to open",
    steps: [
      "Open Password Protect and load the document",
      "Set a strong password and encrypt in the browser",
      "Send the password through a different channel than the file",
    ],
    tip: "Encryption only protects the copy you encrypted. Check shared drives and email sent folders for unencrypted versions of the same document.",
    faq: {
      question: "Can the password be recovered if I lose it?",
      answer:
        "No. The encryption is applied in your browser and no copy of the password is stored anywhere, so an unrecoverable password means an unrecoverable file. Keep a record in your password manager.",
    },
  },
  sign: {
    slug: "sign",
    situation: "The document has to come back signed today, and printing, signing, and scanning it will miss the deadline.",
    name: "e-Sign PDF",
    outcome: "a PDF carrying a visible signature placed exactly where you position it",
    steps: [
      "Open e-Sign PDF and draw your signature once",
      "Place it on the signature line and size it to the page",
      "Download the signed copy and keep the unsigned version for your records",
    ],
    tip: "A drawn signature is a visual mark, not a certificate-backed digital signature. If a counterparty requires cryptographic verification, use their signing platform instead.",
    faq: {
      question: "Is the signature legally binding?",
      answer:
        "That depends on jurisdiction and on the agreement between the parties. PDFTools creates a visible electronic signature; it does not issue a certificate or an audit trail, so check what the other party requires before relying on it.",
    },
  },
  "pdf-to-word": {
    slug: "pdf-to-word",
    situation: "Substantial edits are required, and working directly on positioned PDF text would take hours of manual rebuilds.",
    name: "PDF to Word",
    outcome: "an editable DOCX containing the document's text, headings, and simple lists",
    steps: [
      "Open PDF to Word and load a PDF with selectable text",
      "Run the conversion and download the DOCX",
      "Re-apply complex layout, tables, and columns in your word processor",
    ],
    tip: "Conversion preserves text and reading order, not pixel-perfect layout. Budget editing time for multi-column documents, tables, and footnotes.",
    faq: {
      question: "Why is the DOCX layout different from the PDF?",
      answer:
        "PDF stores positioned glyphs, not paragraphs. The converter reconstructs paragraphs heuristically, so complex layout is simplified. Text is preserved; fine positioning is not.",
    },
  },
  unlock: {
    slug: "unlock",
    situation: "A legitimate copy is locked by a password you already hold, and every downstream tool refuses to open it.",
    name: "Unlock PDF",
    outcome: "an unencrypted copy of a PDF when you know its current password",
    steps: [
      "Open Unlock PDF and load the protected document",
      "Enter the password you already use to open it",
      "Download the unlocked copy and decide where it is safe to store",
    ],
    tip: "Unlocking is for documents you own or are authorised to modify. Removing protection from someone else's file can breach its licence or your contract.",
    faq: {
      question: "Can this tool crack a password I do not know?",
      answer:
        "No. Unlock PDF requires the correct password in order to decrypt. It is a convenience for your own files, not a password-recovery tool.",
    },
  },
  rotate: {
    slug: "rotate",
    situation: "Pages are sideways or upside down, and viewers keep forgetting the orientation as soon as the file is forwarded.",
    name: "Rotate PDF",
    outcome: "a PDF whose page rotation is written into the file, not just the viewer",
    steps: [
      "Open Rotate PDF and load the document",
      "Rotate all pages or only the ones that are sideways",
      "Download the copy and reopen it to confirm the rotation stuck",
    ],
    tip: "Rotating in a viewer does not change the file. Always export a new PDF so the orientation survives on other devices and printers.",
    faq: {
      question: "Will rotation affect the page content quality?",
      answer:
        "No. Rotation changes the page orientation flag only; it does not re-render or re-compress page content, so text and images stay exactly as sharp as before.",
    },
  },
  "delete-pages": {
    slug: "delete-pages",
    situation: "The document contains blank, duplicated, or out-of-scope pages that must not reach the recipient.",
    name: "Delete Pages",
    outcome: "a PDF with the unwanted pages removed and the rest in their original order",
    steps: [
      "Open Delete Pages and load the document",
      "Click the page thumbnails you want removed",
      "Download the new PDF and verify the remaining page count",
    ],
    tip: "Check for cross-references before deleting. Tables of contents, exhibit lists, and page-numbered contracts can point at pages you just removed.",
    faq: {
      question: "Can I undo a page deletion after downloading?",
      answer:
        "Not inside the tool — the deleted pages are not kept. The original file on your device is never modified, so you can always reload it and start again.",
    },
  },
  organize: {
    slug: "organize",
    situation: "Every page exists and is correct, but the sequence is wrong and the reader has to jump backwards to follow it.",
    name: "Organize Pages",
    outcome: "a PDF with pages reordered exactly as you arrange the page tiles",
    steps: [
      "Open Organize Pages and load the document",
      "Drag page tiles until the sequence reads correctly",
      "Export the new ordering and open it once to check the flow",
    ],
    tip: "Reordering pages does not update internal links, bookmarks, or a printed table of contents. Fix those in the source document when they matter.",
    faq: {
      question: "Does reorganising pages change the page numbers printed on them?",
      answer:
        "No. Any page numbers already printed on the page move with the page. If the printed numbering must match the new order, add fresh numbers afterwards with Add Page Numbers.",
    },
  },
  annotate: {
    slug: "annotate",
    situation: "Review feedback has to be visible on the page itself, not buried in a separate comments thread.",
    name: "Annotate PDF",
    outcome: "a flattened PDF with highlights, underlines, and strikethroughs burned in",
    steps: [
      "Open Annotate PDF and load the page you need to mark up",
      "Drag across the passage to highlight, underline, or strike it",
      "Download the flattened copy so the marks show in every viewer",
    ],
    tip: "Flattened marks cannot be toggled off. Keep an unannotated master copy if the same document may be circulated without your review notes.",
    faq: {
      question: "Are annotations editable after I download?",
      answer:
        "No. Marks are burned into the page so they appear identically everywhere. Treat the annotated file as the final marked-up copy, not a working layer.",
    },
  },
  "add-page-numbers": {
    slug: "add-page-numbers",
    situation: "The bundle is assembled but has no page references, so review comments cannot point at a specific page.",
    name: "Add Page Numbers",
    outcome: "sequential page numbers stamped in the position and format you choose",
    steps: [
      "Open Add Page Numbers and load the document",
      "Choose the corner, alignment, start number, and format",
      "Download the numbered copy and check the first and last page",
    ],
    tip: "If the document already has printed numbering, start your stamp at the current count rather than 1 so the two systems agree.",
    faq: {
      question: "Can I start numbering from a page other than the first?",
      answer:
        "Yes. Set the start value and, when the earlier pages should stay blank, apply numbering only to the range that needs it — useful for cover pages and tables of contents.",
    },
  },
  redact: {
    slug: "redact",
    situation: "Sensitive material has to be removed permanently before the document leaves the organisation, with proof it is gone.",
    name: "Redact PDF",
    outcome: "a rasterised PDF where the redacted areas are permanently gone",
    steps: [
      "Open Redact PDF and load a working copy — never your only original",
      "Draw blackout boxes over every instance that must be withheld",
      "Reopen the download and check the redacted text cannot be selected or searched",
    ],
    tip: "A black rectangle drawn over live text is not redaction. Test by searching for the hidden phrase in the output PDF — it must return zero results.",
    faq: {
      question: "Can the hidden text be recovered from a redacted PDF?",
      answer:
        "Not in this tool's output. Redaction rasterises the page, so underlying glyphs, comments, and form values are not present in the file to recover.",
    },
  },
  "extract-text": {
    slug: "extract-text",
    situation: "The wording is needed elsewhere \u2014 a quote, a translation, a search index \u2014 and retyping it risks transcription errors.",
    name: "Extract Text",
    outcome: "a plain-text file containing the selectable text of every page",
    steps: [
      "Open Extract Text and load a PDF with selectable text",
      "Run the extraction and review the page-by-page output",
      "Download the text file for quoting, translation, or search",
    ],
    tip: "If the extraction is empty, the PDF is an image scan. Run OCR PDF first, then extract the recognised text.",
    faq: {
      question: "Why does the extracted text look jumbled?",
      answer:
        "PDFs store text as positioned glyphs, not reading order. Multi-column layouts and tables can interleave. Extract page by page and check the order on complex layouts.",
    },
  },
  watermark: {
    slug: "watermark",
    situation: "The document must be identifiable as a draft or confidential copy wherever it is shared or forwarded.",
    name: "Watermark PDF",
    outcome: "a PDF with your text watermark stamped at the opacity and angle you set",
    steps: [
      "Open Watermark PDF and load the document",
      "Type the watermark text and set size, opacity, and rotation",
      "Download and confirm the mark does not hide essential content",
    ],
    tip: "Keep the opacity low enough that the underlying text is still readable — a watermark that blocks content makes the document unusable for its recipient.",
    faq: {
      question: "Can a recipient remove the watermark?",
      answer:
        "A visible watermark is a deterrent, not a lock. Anyone with PDF editing software can attempt to cover or remove it. For protection, encrypt the file with Password Protect as well.",
    },
  },
  crop: {
    slug: "crop",
    situation: "Scanner borders and wide margins waste space, and trimming them by hand would need a desktop editor.",
    name: "Crop PDF",
    outcome: "a PDF with the page boundaries trimmed to the margins you set",
    steps: [
      "Open Crop PDF and load the scan",
      "Enter top, bottom, left, and right margins",
      "Download and check that no content or page numbers were clipped",
    ],
    tip: "Crop after scanning, not before printing. Cropping a page that still needs to be printed double-sided can shift the alignment on the back.",
    faq: {
      question: "Does cropping delete the trimmed content?",
      answer:
        "It changes the visible page area. Content outside the crop box is no longer shown, so review the output before treating it as the archived copy of a document.",
    },
  },
  "fill-form": {
    slug: "fill-form",
    situation: "An official form has to be completed and returned without printing it or installing form software.",
    name: "Fill PDF Form",
    outcome: "a completed PDF with your answers typed into the real form fields",
    steps: [
      "Open Fill PDF Form and load the form",
      "Type into the text fields and tick the check boxes",
      "Download the completed form — flatten it first if editing must stop",
    ],
    tip: "If clicking a field does nothing, the PDF is a flat image of a form. Check with the issuer whether they accept a typed overlay or need the official fillable version.",
    faq: {
      question: "Will the completed form stay editable for the recipient?",
      answer:
        "Yes, until you flatten it. Run Flatten PDF on a copy if the recipient should receive fixed values they cannot change.",
    },
  },
  "ocr-pdf": {
    slug: "ocr-pdf",
    situation: "The scan looks like a document but hides no text, so nothing can be searched, quoted, or verified.",
    name: "OCR PDF",
    outcome: "recognised text from scanned pages that you can copy, search, and download",
    steps: [
      "Open OCR PDF and load a scanned PDF",
      "Run English OCR and review the recognised text page by page",
      "Correct obvious misreads before you rely on the output",
    ],
    tip: "OCR accuracy depends on scan quality. Straighten the scan, raise the resolution, and avoid heavy compression before running recognition.",
    faq: {
      question: "Does OCR work on handwriting?",
      answer:
        "Poorly. Printed text recognises well; handwriting usually needs manual transcription. AI OCR (a Premium feature) can help with some handwritten and image-heavy pages.",
    },
  },
};

export const audiences: AudienceProfile[] = [
  {
    slug: "college-students",
    label: "for College Students",
    noun: "college students",
    documents: [
      "lecture slide decks exported as 20MB PDFs",
      "scanned textbook chapters and library readings",
      "group project reports with mixed Word, Excel, and photo sources",
    ],
    workflow:
      "Every term starts with a rush of PDFs — syllabus packs, scanned readings, slide decks — and every deadline ends with an upload portal that rejects anything over a few megabytes.",
    caveat:
      "Many course portals and scholarship systems cap uploads at 1–5MB and reject files that are password-protected, so test the exact file in the portal before the deadline rather than an hour before it.",
    tips: [
      "Keep one master folder per course and compress a copy for submission — never the only version of your work",
      "Check the portal's stated limit (some mean 1,000,000 bytes, not 1,048,576) and stay comfortably under it",
    ],
    faqs: [
      {
        question: "Will my university portal accept a browser-processed PDF?",
        answer:
          "Usually yes, because the output is a standard PDF. The two common rejections are an over-limit file size and an unexpected password, so check both before submitting.",
      },
      {
        question: "Can I use these tools on a borrowed library computer?",
        answer:
          "Yes. Everything runs in the browser with no install or account. Close the tab when you finish and the file never persists on the machine's disk through this tool.",
      },
    ],
  },
  {
    slug: "high-school-students",
    label: "for High School Students",
    noun: "high school students",
    documents: [
      "phone photos of handwritten homework pages",
      "permission slips and forms that need a parent signature",
      "group presentations exported from Google Slides",
    ],
    workflow:
      "Homework arrives as photos and forms, and teachers often require a single PDF by a fixed time — frequently on a school-managed device with no software install rights.",
    caveat:
      "School devices often block plugin installs and may not have a PDF editor at all, so browser-based tools are the only option that works inside those restrictions.",
    tips: [
      "Photograph each page straight down against a plain background so Image to PDF produces upright, legible pages",
      "Combine a multi-page assignment into one PDF instead of sending several photos, which teachers lose in crowded inboxes",
    ],
    faqs: [
      {
        question: "Is it okay to submit a PDF made from phone photos?",
        answer:
          "If the assignment does not demand a typed document, a clear photo-based PDF is normally acceptable. Check whether the teacher asks for 'typed' specifically before relying on photos.",
      },
      {
        question: "Can my parents sign a permission slip digitally?",
        answer:
          "A drawn signature placed on the signature line is usually accepted for school paperwork. Confirm with the school office if they require a wet-ink original.",
      },
    ],
  },
  {
    slug: "teachers",
    label: "for Teachers",
    noun: "teachers",
    documents: [
      "exam papers split into per-class versions",
      "answer keys that must not reach students",
      "student worksheets collated into a single marking pack",
    ],
    workflow:
      "A single source exam or worksheet has to become several class versions, a protected answer key, and an evidence pack for moderation — all while lesson planning runs in parallel.",
    caveat:
      "Protected answer keys must be encrypted before they touch a shared drive or LMS question bank, and the password must travel to colleagues by a different route than the file.",
    tips: [
      "Keep the master exam unnumbered and add page numbers only to the printed class copies, so a late change does not force a full reprint",
      "Build one marking pack by merging student submissions alphabetically, which makes cross-marking far faster than opening files one by one",
    ],
    faqs: [
      {
        question: "Can I password-protect an answer key before uploading it to the LMS?",
        answer:
          "Yes. Password Protect applies encryption in your browser, and LMS platforms store the encrypted file as-is. Share the password with colleagues separately.",
      },
      {
        question: "How do I split an exam into separate class sets?",
        answer:
          "Use Split PDF with explicit ranges per class, then download the batch as a ZIP. Each class receives only its own pages.",
      },
    ],
  },
  {
    slug: "office-workers",
    label: "for Office Workers",
    noun: "office workers",
    documents: [
      "monthly management reports assembled from several teams",
      "scanned supplier contracts and signed PO copies",
      "onboarding packs that must be signed and returned",
    ],
    workflow:
      "Reports arrive from four teams in four layouts, get merged into one board pack, then bounce back twice with late corrections — usually the afternoon before the meeting.",
    caveat:
      "Corporate email gateways commonly reject attachments above 10–25MB, so a board pack that opens fine locally can still be blocked by the recipient's mail server.",
    tips: [
      "Merge first and compress last — a single compressed board pack is smaller than several compressed sections merged afterwards",
      "Keep the signed PO copy separate from the priced version, and never distribute a redacted file without searching it for the removed text first",
    ],
    faqs: [
      {
        question: "Why does the email system reject our consolidated report?",
        answer:
          "Mail servers enforce attachment limits, often far below the local file size you see. Compress the merged PDF and check the downloaded size against your IT limit.",
      },
      {
        question: "Is it safe to process confidential reports in a browser?",
        answer:
          "Core tools run locally, so the document is not uploaded. The only exception is opting into an AI feature, which sends extracted text or page images to the AI service.",
      },
    ],
  },
  {
    slug: "freelancers",
    label: "for Freelancers",
    noun: "freelancers",
    documents: [
      "signed proposals and statements of work",
      "invoices bundled with deliverable proofs",
      "portfolio case-study PDFs heavy with images",
    ],
    workflow:
      "Proposals leave as signed PDFs, invoices require a bundled proof of delivery, and the portfolio has to stay under a hosting limit — all without paying for another subscription.",
    caveat:
      "Clients often forward documents onward to finance or legal, so anything you send must survive being opened on a device you will never control.",
    tips: [
      "Flatten forms and annotations before sending so a client cannot type into a finished proposal",
      "Merge the invoice and the delivery proof into one file — separate attachments are the usual reason an invoice sits unpaid",
    ],
    faqs: [
      {
        question: "Can I send the same signed proposal to several clients?",
        answer:
          "Only if the content is identical. For client-specific terms, sign a separate copy per client so an unintended version never reaches the wrong inbox.",
      },
      {
        question: "How do I keep my portfolio PDF under a hosting limit?",
        answer:
          "Compress with Balanced first and compare the visual result. Image-heavy portfolios shrink the most, but check that screenshot text stays legible.",
      },
    ],
  },
  {
    slug: "small-business-owners",
    label: "for Small Business Owners",
    noun: "small business owners",
    documents: [
      "supplier invoices and delivery notes for bookkeeping",
      "employee contracts and signed policy acknowledgements",
      "customer-facing price sheets and service agreements",
    ],
    workflow:
      "Bookkeeping needs one bundle per month, contracts need signatures and secure storage, and price sheets need to look sharp when a customer forwards them.",
    caveat:
      "Accounting records usually must be retained for several years, so keep an unmodified original of every invoice alongside the cleaned-up bundle you file.",
    tips: [
      "Name merged monthly bundles with the period in the filename so the accountant can reconcile them against bank statements",
      "Password-protect payroll and contract files before emailing them, and share the password by phone or chat — never in the same email",
    ],
    faqs: [
      {
        question: "Can I merge a month of invoices into one bookkeeping file?",
        answer:
          "Yes. Merge PDF produces one PDF in the order you set, which is far easier to reconcile than a folder of separate scans. Keep the originals for audit purposes.",
      },
      {
        question: "Do I need a subscription to protect client contracts?",
        answer:
          "No. Password Protect is a core tool and applies encryption without an account or payment. Premium adds larger file limits and batch workflows.",
      },
    ],
  },
  {
    slug: "job-seekers",
    label: "for Job Seekers",
    noun: "job seekers",
    documents: [
      "a two-page CV that must stay under an applicant-tracking-system limit",
      "a cover letter merged with the CV into one submission file",
      "portfolio samples and certificates attached to an application",
    ],
    workflow:
      "Every application portal has a different upload limit, and the same CV has to work for a 2MB government form, an ATS parser, and a human reading on a phone.",
    caveat:
      "Applicant tracking systems parse text, not layout. An image-only or heavily compressed CV can become unreadable to the parser and disappear from the shortlist even though it looks fine on screen.",
    tips: [
      "Keep a text-based master CV and compress a copy for portals — never submit a rasterised version to an ATS",
      "Merge cover letter and CV in the order the portal expects, typically letter first, and use one clear filename",
    ],
    faqs: [
      {
        question: "Will compressing my CV break the ATS parser?",
        answer:
          "Lossless compression keeps selectable text, which is what parsers read. Visual compression modes rasterise the page and can destroy parseability, so use them only where a human reads the file.",
      },
      {
        question: "Should I merge my cover letter and CV into one PDF?",
        answer:
          "When a portal allows only one attachment, yes. Put the cover letter first and keep each document to a single page section so the reader knows where one ends.",
      },
    ],
  },
  {
    slug: "recruiters",
    label: "for Recruiters",
    noun: "recruiters",
    documents: [
      "candidate CV batches sent to a hiring manager",
      "interview scorecards and feedback sheets",
      "offer letters and signed acceptance copies",
    ],
    workflow:
      "A shortlist of a dozen CVs has to reach a hiring manager as one review pack, while candidate personal data has to be stripped before it circulates any wider.",
    caveat:
      "Candidate data is personal data under most privacy regimes; circulating CVs with phone numbers and home addresses to an external panel can breach retention and minimisation rules.",
    tips: [
      "Redact contact details on the panel copy while keeping the recruiter copy intact, and label the two files clearly",
      "Merge shortlisted CVs in interview order and add page numbers so panel feedback can reference a specific page",
    ],
    faqs: [
      {
        question: "How do I stop a panel seeing candidate contact details?",
        answer:
          "Redact the contact fields on a working copy, confirm the numbers no longer appear when you search the output, and keep the unredacted original in your applicant-tracking system.",
      },
      {
        question: "Can I add Bates-style numbering to a candidate pack?",
        answer:
          "Bates Numbering is built for legal exhibits but works for any pack that needs sequential page references. It is a professional tool with a small lifetime trial.",
      },
    ],
  },
  {
    slug: "researchers",
    label: "for Researchers",
    noun: "researchers",
    documents: [
      "scanned journal articles that need searchable text",
      "literature review bundles for a supervisor",
      "grant application appendices with strict page limits",
    ],
    workflow:
      "Reading starts as a stack of scanned PDFs, becomes a searchable quote bank, and finally has to fit a grant appendix with a hard page and size limit.",
    caveat:
      "Citation accuracy depends on the text layer. Extracting text from a poor scan can silently corrupt author names and numbers, so spot-check every quote against the page image.",
    tips: [
      "OCR before extracting text, and verify a sample of extracted quotes against the rendered page image",
      "Merge appendices in the order the funder's checklist demands and add page numbers so reviewers can reference exact pages",
    ],
    faqs: [
      {
        question: "Can OCR make an old scanned paper searchable?",
        answer:
          "Yes, when the scan is reasonably clean. OCR adds a recognised text layer you can search and extract; low-resolution or skewed scans still need checking against the page image.",
      },
      {
        question: "How do I keep a grant appendix under the page limit?",
        answer:
          "Merge the appendix sections, crop excess margins, and compress a copy. Confirm the final page count against the funder's rule before submission.",
      },
    ],
  },
  {
    slug: "lawyers",
    label: "for Lawyers",
    noun: "lawyers",
    documents: [
      "discovery bundles requiring sequential Bates numbering",
      "contract versions that must be diffed clause by clause",
      "client records with privileged material that must be withheld",
    ],
    workflow:
      "Every matter ends in a production set: numbered exhibits, a redacted version for the other side, and a clean copy for the file — all with an auditable page reference for every document.",
    caveat:
      "Redaction failures are the single most damaging error in legal production. A black box over live text is not redaction, and courts have sanctioned firms for exactly that mistake.",
    tips: [
      "Always produce a Bates-numbered set last, after every insertion and deletion, so page references remain stable",
      "Search the redacted output for the withheld terms before service — a zero-result search is the minimum proof the text is gone",
    ],
    faqs: [
      {
        question: "How do I make sure a redaction is irreversible?",
        answer:
          "Use a tool that rasterises the page, then search the output for the redacted phrase. If the search finds it, the text layer survived and the document is not safely redacted.",
      },
      {
        question: "Can Bates numbering stay consistent across a merged bundle?",
        answer:
          "Yes, if you merge first and number last. Numbering before a later merge produces duplicate or out-of-sequence stamps that undermine the exhibit references.",
      },
    ],
  },
  {
    slug: "accountants",
    label: "for Accountants",
    noun: "accountants",
    documents: [
      "client bank statements and scanned receipts",
      "quarterly management accounts with tables that must go to Excel",
      "tax supporting schedules for submission portals",
    ],
    workflow:
      "Client records arrive as scans and PDF statements, have to become spreadsheet rows for reconciliation, then go back out as a single tidy submission file.",
    caveat:
      "Numbers extracted from PDFs must be reconciled, not trusted. A decimal or sign silently misplaced during extraction can turn a reconciling item into an audit finding.",
    tips: [
      "Extract tables to CSV on a copy and reconcile the totals against the source statement before importing",
      "Compress the final submission file only after all reconciliation is complete, so no one is working from a rasterised copy",
    ],
    faqs: [
      {
        question: "Can I extract financial tables from a PDF into Excel?",
        answer:
          "PDF to CSV extracts positioned text into rows you can open in Excel. Results depend on the PDF's construction, so always reconcile totals against the statement.",
      },
      {
        question: "Is it safe to process client tax records in a browser?",
        answer:
          "Core tools process locally, so records are not uploaded. Review your firm's data-handling policy and avoid AI features for confidential client data unless cleared.",
      },
    ],
  },
  {
    slug: "healthcare-workers",
    label: "for Healthcare Workers",
    noun: "healthcare workers",
    documents: [
      "referral letters and clinic correspondence",
      "insurance claim forms that need completing and signing",
      "patient records with identifiers that must be removed before sharing",
    ],
    workflow:
      "Clinical paperwork moves between teams, insurers, and outside providers, and every copy has to carry only the minimum information the recipient actually needs.",
    caveat:
      "Patient identifiers appear in more places than the obvious fields — headers, footers, file names, and embedded metadata all leak information if left in place.",
    tips: [
      "Strip metadata as well as visible identifiers, because author and title fields often carry staff or patient names",
      "Share only the pages the receiving clinician needs; split the document rather than sending the whole record",
    ],
    faqs: [
      {
        question: "Does removing names from a page make a record anonymous?",
        answer:
          "Not always. Dates, rare diagnoses, and free-text notes can re-identify a patient. Follow your organisation's de-identification policy rather than relying on a single redaction pass.",
      },
      {
        question: "Are uploaded patient records stored on a server?",
        answer:
          "Core tools process in the browser and do not upload the file. Avoid optional AI features for tangible patient identifiers unless your organisation has explicitly approved them.",
      },
    ],
  },
  {
    slug: "real-estate-agents",
    label: "for Real Estate Agents",
    noun: "real estate agents",
    documents: [
      "listing packages with floor plans and property photos",
      "offer documents and countersigned acceptance pages",
      "lease agreements that need initials and signatures on every page",
    ],
    workflow:
      "A listing has to look sharp in an inbox, an offer has to be signed and returned within hours, and a lease needs initials where the buyer expects them.",
    caveat:
      "Photo-heavy listing PDFs are the most common reason an email attachment bounces, and a bounced offer at a deadline can cost the deal outright.",
    tips: [
      "Compress the listing package and keep a high-resolution version for the portal upload, where limits are usually more generous",
      "Merge the signed acceptance page into the offer PDF so the counterparty receives one complete document, not two attachments",
    ],
    faqs: [
      {
        question: "Why does my listing PDF fail to send as an email attachment?",
        answer:
          "Property photo packages routinely exceed mail server attachment limits. Compress a copy and check the downloaded file size against the recipient's server limit.",
      },
      {
        question: "Can clients sign offer pages without printing?",
        answer:
          "A visible drawn signature works for many routine documents. Where a broker or solicitor requires a certified digital signature, use their platform instead.",
      },
    ],
  },
  {
    slug: "students-abroad",
    label: "for International Students",
    noun: "international students",
    documents: [
      "visa application packs with strict size and format rules",
      "transcripts and degree certificates from another country",
      "financial evidence statements for an admissions portal",
    ],
    workflow:
      "One application file has to satisfy a consulate's size cap, an admissions portal's page order, and an embassy's requirement for a signed and dated copy — often across three time zones.",
    caveat:
      "Embassy portals reject files with a password, an unusual page size, or a scanned image where text was expected — and rejections can cost an entire intake cycle.",
    tips: [
      "Keep an uncompressed master of every official document and compress only the upload copy, so verification letters stay legible",
      "Check the consulate's exact size and page limits before assembling the pack, then assemble once against those rules",
    ],
    faqs: [
      {
        question: "Will a compressed transcript still be accepted?",
        answer:
          "Usually, if the seal, signature, and grades remain clearly legible. Reopen the compressed copy at 100% zoom and confirm every stamp is readable before uploading.",
      },
      {
        question: "How should I order a visa application PDF?",
        answer:
          "Follow the consulate's checklist order exactly, then merge in that sequence. Add page numbers only if the instructions ask for them.",
      },
    ],
  },
  {
    slug: "remote-workers",
    label: "for Remote Workers",
    noun: "remote workers",
    documents: [
      "contracts routed through chat and email across time zones",
      "shared reports annotated during asynchronous review",
      "expense receipts bundled for a monthly claim",
    ],
    workflow:
      "Documents move through chat, email, and shared drives while colleagues are asleep, so every file has to be self-explanatory without a meeting to explain it.",
    caveat:
      "Chat uploads cap file size aggressively and strip nothing, so a document shared in a channel can carry metadata, tracked changes, and comments into a much wider audience.",
    tips: [
      "Strip metadata and annotations before posting a document in a team channel — chat history is often more widely visible than the drive folder",
      "Flatten a reviewed document before the final share so late comments cannot reappear after sign-off",
    ],
    faqs: [
      {
        question: "Why does Slack reject my PDF?",
        answer:
          "Chat platforms enforce their own upload limits, independent of the file's origin. Compress a copy, then confirm the resulting size and readability before reposting.",
      },
      {
        question: "How do I share a signed contract with a distributed team?",
        answer:
          "Sign the final version, compress or protect a copy as needed, and share a stable link rather than re-uploading to each channel.",
      },
    ],
  },
];

function generateSlug(toolSlug: string, audienceSlug: string): string {
  const toolName = toolProfiles[toolSlug]?.name.toLowerCase().replace(/\s+/g, "-") ?? toolSlug;
  return `${toolName}-${audienceSlug}`;
}

export function getAllSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  for (const tool of Object.values(toolProfiles)) {
    for (const audience of audiences) {
      const slug = generateSlug(tool.slug, audience.slug);
      const [docA, docB, docC] = audience.documents;

      pages.push({
        slug,
        title: `${tool.name} ${audience.label} — Free, Private Browser Tool`,
        description: `Use ${tool.name} ${audience.label} to produce ${tool.outcome}. Built for ${docA}, ${docB}, and ${docC}. Runs in your browser with no upload and no advertising.`,
        h1: `${tool.name} ${audience.label}: ${docA.charAt(0).toUpperCase()}${docA.slice(1)} and More`,
        toolSlug: tool.slug,
        toolName: tool.name,
        audience: audience.label,
        painPoint: `${tool.situation} For ${audience.noun}, that usually means ${docA}, ${docB}, and ${docC}. ${audience.workflow}`,
        painPoints: [...audience.documents],
        benefit: `${tool.name} produces ${tool.outcome} — entirely in the browser, so the document never leaves the device it was opened on.`,
        faqs: [
          ...audience.faqs,
          tool.faq,
        ],
        workflow: `${tool.situation} ${audience.workflow} The routine is repeatable: ${tool.steps[0].toLowerCase()}, then ${tool.steps[1].toLowerCase()}.`,
        examples: [
          `A typical ${audience.noun.replace(/s$/, "")} job for this tool: ${tool.outcome} from ${docA}.`,
          `Second common case: building ${docB} into a single shareable file without an account.`,
          `Third case: preparing ${docC} for a recipient who only accepts standard PDFs.`,
        ],
        steps: [...tool.steps],
        tips: [...audience.tips, tool.tip],
        caveat: audience.caveat,
      });
    }
  }

  return pages;
}

export const seoPages = getAllSeoPages();
