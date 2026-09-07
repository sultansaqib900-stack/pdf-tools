/**
 * Long-form editorial content for tool pages.
 *
 * Kept as data rather than JSX so a guide is cheap to add and easy to audit.
 * Inline links use a markdown-style `[label](/href)` syntax, rendered by
 * <ToolGuide/>. Bold uses **double asterisks**.
 *
 * Guidance for adding entries: say something a competitor's page does not.
 * The failure modes, the caveats and the "this will not work when..." notes
 * are the parts that earn the ranking; a restatement of the button labels is
 * not worth the words.
 */

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideSection {
  heading: string;
  paras: string[];
}

export interface ToolGuideData {
  summary: string;
  steps?: GuideStep[];
  sections: GuideSection[];
}

export const toolGuides: Record<string, ToolGuideData> = {
  "pdf-to-word": {
    summary:
      "**To convert a PDF to Word:** add the file above and download the .docx. Text-based PDFs convert cleanly. A scanned PDF is a picture of text, so run [OCR](/ocr-pdf) on it first or the Word file will contain images rather than editable words.",
    steps: [
      { title: "Add the PDF", body: "The file is read in your browser. Nothing is uploaded to a server." },
      { title: "Convert", body: "Text, paragraph breaks and basic structure are extracted into a Word document." },
      { title: "Check the layout before editing", body: "Open the .docx and skim it. Complex multi-column layouts and tables are where converters drift, and it is easier to fix formatting before you start rewriting content." },
    ],
    sections: [
      {
        heading: "Why conversions lose formatting",
        paras: [
          "A PDF does not store paragraphs, headings or tables. It stores instructions for painting glyphs at coordinates on a page. Converting to Word means inferring the document structure back out of that positioning — which paragraph a line belongs to, whether a run of aligned text is a table or a coincidence.",
          "That inference is reliable for straightforward reports and letters. It degrades on magazine-style layouts, multi-column academic papers, forms and anything with text wrapped around images. If a document was originally created in Word, converting back will rarely reproduce the original styling exactly.",
        ],
      },
      {
        heading: "Scanned documents need OCR first",
        paras: [
          "If you cannot select text in the PDF with your cursor, there is no text in it — only an image of text. Converting that to Word produces a document containing a picture, which is not editable.",
          "Run [OCR PDF](/ocr-pdf) first to add a real text layer, then convert. Check the OCR output for errors before relying on it, since recognition on low-quality scans reliably confuses characters like 1, l and I, or 0 and O.",
        ],
      },
      {
        heading: "When you should not convert at all",
        paras: [
          "If you only need to fill in fields, use [Fill PDF forms](/fill-form). If you need to add a signature, use [Sign PDF](/sign). If you need to annotate or comment, use [Annotate PDF](/annotate). Each avoids a lossy round-trip through Word entirely.",
          "Converting to Word and back to PDF also strips any interactive form fields and invalidates a cryptographic digital signature, since the file bytes change. Only convert when you genuinely need to rewrite the text.",
        ],
      },
    ],
  },

  "word-to-pdf": {
    summary:
      "**To convert Word to PDF:** add your .docx above and download the PDF. This is the reliable direction of conversion — PDF is a fixed-layout format, so the result looks the same on every device, which is exactly why documents are shared as PDFs.",
    steps: [
      { title: "Add your .docx", body: "The document is read locally in your browser." },
      { title: "Convert and download", body: "Text, layout and page breaks are rendered to a fixed PDF page." },
      { title: "Check fonts and page breaks", body: "Skim the output before sending. Unusual fonts and very tight layouts are where a converted document is most likely to shift." },
    ],
    sections: [
      {
        heading: "Why send a PDF instead of a Word file",
        paras: [
          "A Word document renders using the fonts and settings on the reader's machine, so the same file can paginate differently on another computer. A recipient without your fonts sees substitutes, and a carefully positioned table can move to the next page.",
          "A PDF fixes the layout. This matters most for anything where presentation carries meaning: an invoice, a CV, a signed contract, a formatted report. It also makes casual editing harder, which is usually desirable for a document that is final.",
        ],
      },
      {
        heading: "Fonts are the usual cause of surprises",
        paras: [
          "If your document uses an unusual typeface, embed it or switch to a widely available one before converting. Font substitution changes character widths, which shifts line breaks, which can cascade into changed pagination across the whole document.",
          "The same applies to documents assembled from multiple sources, where pasted sections often carry their own fonts. Normalising the styling in Word first produces a far more predictable PDF.",
        ],
      },
      {
        heading: "After converting",
        paras: [
          "If the PDF is going by email and comes out large, [compress it](/compress) — Word documents with embedded images often produce bulky PDFs. To combine it with other documents, use [Merge PDF](/merge).",
          "For a document that must not be altered, [flatten it](/flatten-pdf) to fix any form fields as page content, and [password-protect it](/protect) if it is confidential.",
        ],
      },
    ],
  },

  "ocr-pdf": {
    summary:
      "**To OCR a PDF:** add a scanned file above and the tool adds an invisible text layer beneath the page images, making the document searchable and its text selectable. The pages look identical; what changes is that the words become machine-readable.",
    steps: [
      { title: "Add the scanned PDF", body: "Works on scans, photographed pages and image-only PDFs." },
      { title: "Run recognition", body: "Each page is analysed and the recognised text is stored as a hidden layer aligned to the image." },
      { title: "Verify the accuracy", body: "Search for a word you can see on the page. If it is found, the layer is working. Spot-check any figures you intend to rely on." },
    ],
    sections: [
      {
        heading: "How to tell whether a PDF needs OCR",
        paras: [
          "Try to select a line of text with your cursor. If you get a selection box around the whole page instead of a text highlight, the page is an image and needs OCR. Ctrl+F finding nothing for a word plainly visible on screen is the same signal.",
          "This is common in library scans, older journal archives, documents received by fax, and anything photographed on a phone.",
        ],
      },
      {
        heading: "Scan quality sets the ceiling",
        paras: [
          "Recognition accuracy depends almost entirely on the input. A clean 300 DPI scan of printed text recognises very well. A photograph taken at an angle in poor light, a faint photocopy, or a document with heavy background texture will produce errors no engine can avoid.",
          "Handwriting is a different problem from printed text and should not be expected to work. Small print, tightly set tables and unusual typefaces also reduce accuracy.",
          "If you are scanning the document yourself, scan at 300 DPI in greyscale, flatten the page properly, and avoid shadows. Ten seconds of care at scan time saves far more time than correcting recognition errors afterwards.",
        ],
      },
      {
        heading: "Always verify before relying on the text",
        paras: [
          "OCR output is a best guess, not a transcript. Digits are the most dangerous failure because an error is invisible unless you check: 1 and l, 0 and O, 5 and S, 8 and B are routinely confused.",
          "If you are extracting figures from a financial statement or citing a quotation, read the recognised text against the image for those specific passages. Once verified, [Extract text](/extract-text) will pull the content out as plain text.",
        ],
      },
    ],
  },

  "sign": {
    summary:
      "**To sign a PDF:** add the document, draw or type your signature, position it on the page and download. This produces a visible signature image on the page, which is what the overwhelming majority of business and personal agreements require.",
    steps: [
      { title: "Add the document", body: "The PDF is opened in your browser and is not uploaded." },
      { title: "Create your signature", body: "Draw it with a mouse, trackpad or finger, or type your name in a signature typeface." },
      { title: "Place it", body: "Position the signature over the signature line and size it to fit. Add the date if the document asks for it." },
      { title: "Download and send", body: "Download the signed PDF and return it. Consider [flattening](/flatten-pdf) it first so the signature becomes fixed page content." },
    ],
    sections: [
      {
        heading: "Are electronic signatures legally valid?",
        paras: [
          "For most commercial and personal agreements, yes. In the United States the ESIGN Act and UETA give electronic signatures the same legal effect as handwritten ones, and in the EU and UK, eIDAS does the same. Contracts, NDAs, offer letters, leases and consent forms are routinely executed this way.",
          "There are exceptions that vary by jurisdiction, commonly including wills, certain trusts, some property transfers and a handful of family law documents. Where a document is high value or unusual, confirm the requirements rather than assuming.",
        ],
      },
      {
        heading: "A drawn signature is not a digital certificate",
        paras: [
          "This tool adds a visible signature image to the page. That is different from a cryptographic digital signature, which binds an identity certificate to the exact bytes of the file and can prove the document has not been altered since signing.",
          "For ordinary agreements the visible signature is what is expected and is sufficient. If a counterparty specifically requires a certificate-based signature — common in regulated filings and some government submissions — you need a service that issues certificates, which this tool does not do.",
          "Note also that a cryptographic signature already on a document will stop validating if the file is later modified, including by [merging](/merge) or [compressing](/compress) it. Do those steps before signing, not after.",
        ],
      },
      {
        heading: "Practical points that avoid rejected documents",
        paras: [
          "Sign the flattened, final version. If you sign a draft and the counterparty then changes a clause, your signature now sits on a superseded document. Use [Compare two PDFs](/pdf-diff) to check a returned agreement for changes before signing it.",
          "After signing, [flatten the document](/flatten-pdf) so the signature cannot be dragged or deleted, and if the agreement contains personal or commercial detail, [password-protect it](/protect) before emailing.",
        ],
      },
    ],
  },

  "protect": {
    summary:
      "**To password-protect a PDF:** add the file, set a password and download the encrypted document. Anyone opening it will need the password. Choose a strong one and send it to the recipient through a different channel from the document itself.",
    steps: [
      { title: "Add your PDF", body: "The document is encrypted in your browser; nothing is uploaded." },
      { title: "Set a password", body: "Use a long passphrase rather than a short complex string. Length defeats brute force far more effectively than substituting symbols for letters." },
      { title: "Download and share safely", body: "Send the password by a separate channel — a phone call or message, not the same email as the attachment." },
    ],
    sections: [
      {
        heading: "Never send the password with the document",
        paras: [
          "Putting the password in the covering email removes the entire benefit. If the email is misdirected or the mailbox is compromised, the recipient has both halves. This is the single most common mistake with protected PDFs.",
          "Send the file by email and the password by text message or in person. For recurring exchanges with the same counterparty, agree a passphrase in advance and reuse the channel, not the password.",
        ],
      },
      {
        heading: "What PDF encryption does and does not protect against",
        paras: [
          "Password encryption protects the file at rest and in transit — someone who intercepts it cannot read the contents without the password. That is genuine protection and worth using for anything confidential.",
          "It does not control what a legitimate recipient does next. Once they open it they can copy text, screenshot pages or forward the decrypted document. So-called permission passwords, which claim to prevent printing or copying, are widely ignored by PDF readers and should not be relied on.",
          "Encryption also does not remove anything hidden inside the document. Metadata, revision traces and content concealed behind a drawn black box all remain, and are visible to anyone with the password. Run [the metadata sanitiser](/metadata-sanitizer) and use [proper redaction](/redact) before protecting.",
        ],
      },
      {
        heading: "If you forget the password",
        paras: [
          "There is no recovery. Encryption without a back door is the point, so a lost password means a lost document. Store it in a password manager rather than relying on memory.",
          "If you hold a document you are authorised to access and have the password, [Unlock PDF](/unlock) removes the protection so it can be processed by other tools.",
        ],
      },
    ],
  },

  "unlock": {
    summary:
      "**To unlock a PDF:** add the protected file and enter the password you hold, then download an unprotected copy. This removes encryption from a document you already have the right to open — it does not break or recover an unknown password.",
    steps: [
      { title: "Add the protected PDF", body: "The file is processed in your browser." },
      { title: "Enter the password", body: "You need the password. This tool decrypts with it; it does not guess it." },
      { title: "Download the unlocked copy", body: "The result opens without a password and can be used with other tools." },
    ],
    sections: [
      {
        heading: "This does not recover a forgotten password",
        paras: [
          "PDF encryption is real cryptography, and there is no legitimate way to bypass it without the password. Any service claiming to instantly remove any PDF password is either running a brute-force attack that only succeeds on weak passwords, or is not doing what it claims.",
          "If you have genuinely lost the password to your own document, the practical options are recovering it from a password manager or browser store, asking whoever created the file, or recreating the document from its source.",
        ],
      },
      {
        heading: "Only unlock documents you are entitled to open",
        paras: [
          "Removing protection from a document you have been given the password to, so you can compress or merge it, is normal document handling. Circumventing protection on material you are not authorised to access is another matter and may be unlawful depending on your jurisdiction.",
        ],
      },
      {
        heading: "Why you might need to unlock a file",
        paras: [
          "Most PDF processing tools cannot operate on an encrypted document, so a protected file must be decrypted before it can be [compressed](/compress), [merged](/merge) or [split](/split).",
          "Once you have finished processing, [re-protect the result](/protect) if it is still confidential. It is easy to forget that the output of a merge is an unencrypted document even when its sources were protected.",
        ],
      },
    ],
  },

  "redact": {
    summary:
      "**To redact a PDF properly:** add the file, mark the content to remove and download. This deletes the underlying content rather than covering it. Drawing a black rectangle in an image editor or annotator does **not** redact — the text stays in the file and can be copied straight out.",
    steps: [
      { title: "Add the document", body: "Processing happens in your browser, which matters for exactly the sensitive documents that need redacting." },
      { title: "Mark what must be removed", body: "Select the regions containing the sensitive content." },
      { title: "Apply the redaction", body: "The content within the marked areas is removed from the document, not masked." },
      { title: "Verify before sending", body: "Open the output, try to select text in the redacted area, and run [Extract text](/extract-text) to confirm the terms are gone." },
    ],
    sections: [
      {
        heading: "Why the black box keeps causing data breaches",
        paras: [
          "A PDF has layers. Drawing a filled rectangle adds a shape on top of the page; the text beneath is untouched and still present in the file's content stream. Selecting the region and copying returns the hidden words. Deleting the annotation reveals them. Text extraction dumps them out in full.",
          "This has produced repeated real-world disclosures of names, financial figures and case details in court filings and published reports. The document looked correct on screen, which is precisely why nobody checked.",
          "Genuine redaction removes the content itself, so there is nothing underneath to recover.",
        ],
      },
      {
        heading: "Redaction alone is not enough",
        paras: [
          "Removing visible text does not remove everything that identifies a document. Metadata carries the author name, the originating file path and revision timestamps. Run [the metadata sanitiser](/metadata-sanitizer) as a separate step.",
          "[Flatten the document](/flatten-pdf) as well, so no annotation or form layer survives that might hold earlier content. If the file came from Word, be aware that comments and tracked changes can persist through conversion.",
        ],
      },
      {
        heading: "Verify every time",
        paras: [
          "Treat verification as part of the process, not an optional check. Open the redacted file, attempt to select text across the redacted region, and search for the specific terms you removed.",
          "For a term that recurs throughout a long document — a name, an account number — use [Search & Redact](/search-redact) rather than relying on visual inspection. Missing one instance on page 240 defeats the whole exercise.",
        ],
      },
    ],
  },

  "edit-pdf": {
    summary:
      "**To edit a PDF:** add the file above and add text, images or annotations, then download. Browser-based editing works by overlaying new content onto the page. Reflowing an existing paragraph in its original font is a different and much harder operation — see below for the right approach.",
    steps: [
      { title: "Add your PDF", body: "The document opens in your browser and is not uploaded." },
      { title: "Make your changes", body: "Add text boxes, images, highlights and notes where you need them." },
      { title: "Download the edited file", body: "Export the result. [Flatten it](/flatten-pdf) if the edits should be permanent." },
    ],
    sections: [
      {
        heading: "Overlay editing versus true text editing",
        paras: [
          "There are two different things people mean by editing a PDF. Adding content on top — a text box, a signature, a correction, a highlight — is straightforward and is what most tasks require.",
          "Changing a word in the middle of an existing paragraph and having the rest of the text reflow around it is far harder, because a PDF stores positioned glyphs rather than paragraphs. Doing it well requires reconstructing the text layout model and having the original embedded font available. This is where paid desktop software genuinely earns its price.",
          "If you need substantial text rewriting, the pragmatic route is [convert to Word](/pdf-to-word), edit there, and [convert back](/word-to-pdf) — accepting that complex layouts may shift.",
        ],
      },
      {
        heading: "Pick the specific tool for the job",
        paras: [
          "Most editing requests are actually a narrower task. To complete a form, use [Fill PDF forms](/fill-form). To add a signature, [Sign PDF](/sign). To comment on a draft, [Annotate PDF](/annotate). To remove pages, [Delete pages](/delete-pages). To reorder them, [Organize pages](/organize).",
          "Using the specific tool is faster and avoids unnecessary re-encoding of the document.",
        ],
      },
      {
        heading: "Editing does not remove what is already there",
        paras: [
          "Covering old content with a white box or a new text box hides it visually but leaves it in the file, recoverable by copying or text extraction. If the point is to remove information, use [Redact PDF](/redact), which deletes the underlying content.",
        ],
      },
    ],
  },

  "image-to-pdf": {
    summary:
      "**To convert images to PDF:** add JPG or PNG files above, arrange them in order and download a single PDF. This is the standard way to turn photographed receipts, ID documents or handwritten pages into something you can submit or email as one file.",
    steps: [
      { title: "Add your images", body: "Select several at once. JPG and PNG are both supported." },
      { title: "Set the order", body: "Arrange the images; each becomes one page in the order shown." },
      { title: "Download the PDF", body: "One document containing every image as a page." },
    ],
    sections: [
      {
        heading: "Photograph pages properly and the PDF looks professional",
        paras: [
          "Most poor-quality document photos share the same causes: shadow across the page, the camera held at an angle so the page looks trapezoidal, and low light producing noise. Each is avoidable in a few seconds.",
          "Put the page on a flat, contrasting surface in even daylight, hold the camera directly above it rather than at an angle, and let the camera focus before shooting. A well-lit straight-on photo converts into something that reads as a scan rather than a snapshot.",
          "For repeated document capture, [Scan to PDF](/scan-to-pdf) is the better tool because it handles edge detection and page sizing.",
        ],
      },
      {
        heading: "Photographed text is not searchable text",
        paras: [
          "A PDF made from photographs contains images, so Ctrl+F will find nothing and the text cannot be copied. If you need the content to be searchable — for records, for citation, or because a recipient expects it — run [OCR](/ocr-pdf) on the resulting PDF.",
        ],
      },
      {
        heading: "Managing file size",
        paras: [
          "Modern phone cameras produce large images, and twenty photographed pages can easily exceed an email limit. [Compress the PDF](/compress) after converting; scanned and photographed content compresses substantially with little visible loss.",
          "If pages came out sideways, [Rotate](/rotate) fixes them, and [Organize pages](/organize) lets you reorder anything added in the wrong sequence.",
        ],
      },
    ],
  },

  "pdf-to-images": {
    summary:
      "**To convert a PDF to images:** add the file above and download each page as a JPG or PNG. Useful for pulling a figure into a presentation, posting a page to social media, or embedding a document page where a PDF cannot be displayed.",
    steps: [
      { title: "Add your PDF", body: "Rendering happens in your browser." },
      { title: "Choose format and quality", body: "PNG for text and line art where sharpness matters; JPG for photographic pages where file size matters." },
      { title: "Download the images", body: "One image per page, at the resolution you selected." },
    ],
    sections: [
      {
        heading: "PNG or JPG, and why it matters",
        paras: [
          "PNG is lossless and keeps text edges crisp, which is what you want for pages of text, diagrams, charts and screenshots. The files are larger.",
          "JPG uses lossy compression that suits photographs but introduces soft halos around sharp text edges. For a page of body text, JPG at moderate quality visibly degrades legibility. Use it for image-heavy pages where size is the priority.",
        ],
      },
      {
        heading: "Resolution: match it to the use",
        paras: [
          "For on-screen use such as a slide or a web page, standard resolution is fine and keeps files manageable. For printing, or where someone will zoom in on detail, export at a higher resolution — a low-resolution export cannot be improved afterwards.",
          "Converting a page to an image discards the text layer, so the result is not searchable or selectable. If you need the text, use [Extract text](/extract-text) instead.",
        ],
      },
      {
        heading: "Going the other way",
        paras: [
          "To rebuild a PDF from images, use [Image to PDF](/image-to-pdf). Round-tripping a PDF to images and back is lossy and inflates file size considerably, so avoid it unless the intermediate images are the actual goal.",
        ],
      },
    ],
  },

  "pdf-to-excel": {
    summary:
      "**To extract tables from a PDF to Excel:** add the file above and download the data as a spreadsheet. Works best on documents with clearly ruled tables. Expect to check the output — table extraction is inference, and merged cells and multi-line rows are where it drifts.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser; the document is not uploaded." },
      { title: "Extract", body: "Tabular regions are detected and their cell contents pulled into rows and columns." },
      { title: "Check the alignment", body: "Open the spreadsheet and compare a few rows against the PDF, particularly around merged cells and any row that wraps onto two lines." },
    ],
    sections: [
      {
        heading: "Why table extraction is harder than it looks",
        paras: [
          "A PDF does not record that something is a table. It records text placed at coordinates. Extraction works by inferring structure from alignment: text at consistent horizontal positions is probably a column, consistent vertical spacing is probably a row.",
          "That inference is strong when a table has ruled lines and every cell holds a single line of text. It weakens with merged cells, cells that wrap onto several lines, nested headers, and tables split across a page break, where the header may be repeated or absent.",
        ],
      },
      {
        heading: "Getting a usable result",
        paras: [
          "Extract one table at a time where you can, rather than a whole report at once. If the document is a scan, run [OCR](/ocr-pdf) first — otherwise there is no text to extract, only pixels.",
          "Always spot-check numbers before using them for anything financial. A misaligned column is easy to miss and produces confidently wrong totals.",
        ],
      },
      {
        heading: "Related extraction tasks",
        paras: [
          "If you need the text of the document rather than its tables, [Extract text](/extract-text) is more direct. If the data lives in PDF form fields rather than a printed table, [Form data extraction](/form-data-extract) pulls the field values out cleanly, which is far more reliable than reading them off the page.",
        ],
      },
    ],
  },

  "rotate": {
    summary:
      "**To rotate PDF pages:** add the file, turn the affected pages 90, 180 or 270 degrees and download. The rotation is saved into the document, so it stays correct for everyone who opens it — unlike the temporary rotate button in a PDF reader.",
    steps: [
      { title: "Add the PDF", body: "The document opens in your browser." },
      { title: "Rotate the pages that need it", body: "Rotate everything at once, or only the specific pages that came out sideways." },
      { title: "Download", body: "The corrected orientation is stored in the file itself." },
    ],
    sections: [
      {
        heading: "Viewer rotation is not saved rotation",
        paras: [
          "The rotate control in most PDF readers changes only your view of the document. Close it and reopen, or send it to someone else, and the pages are sideways again. It is a display setting, not a change to the file.",
          "Rotating with this tool writes the orientation into the document, so it prints and displays correctly everywhere. This is what you want before sending a scanned document to anyone.",
        ],
      },
      {
        heading: "Mixed orientations in one document",
        paras: [
          "Scanned batches frequently contain a few pages fed in the wrong way, and documents that mix portrait text with landscape tables are normal. You can rotate individual pages rather than the whole file, which preserves intentionally landscape pages while fixing the mistakes.",
          "If pages are also in the wrong sequence, [Organize pages](/organize) handles reordering and rotation together, which is quicker than doing two passes.",
        ],
      },
      {
        heading: "Rotation does not re-encode the page",
        paras: [
          "Rotating sets a page attribute rather than redrawing the content, so there is no quality loss and the file size barely changes. You can rotate as many times as you like without degrading the document.",
        ],
      },
    ],
  },

  "delete-pages": {
    summary:
      "**To delete pages from a PDF:** add the file, select the pages to remove and download the result. Useful for stripping cover sheets, blank scanner pages, or an answer key before circulating a document.",
    steps: [
      { title: "Add your PDF", body: "Processed locally in your browser." },
      { title: "Select the pages to remove", body: "Choose individual pages or ranges. Check against the reader's page numbers, which may differ from the printed ones." },
      { title: "Download the shortened document", body: "The remaining pages keep their original quality and formatting." },
    ],
    sections: [
      {
        heading: "Deleting a page removes it from the file",
        paras: [
          "Unlike hiding or covering content, deleting a page removes that page's content from the document entirely. There is nothing left underneath to recover, which makes this a safe way to drop a page containing information the recipient should not see.",
          "The caveat is that this applies to whole pages only. If sensitive content sits on a page you need to keep, deleting is not the answer — use [Redact PDF](/redact) to remove that specific content.",
        ],
      },
      {
        heading: "Common uses",
        paras: [
          "Removing an answer key or mark scheme before distributing a worksheet, dropping the blank pages a scanner inserts on duplex mode, cutting an internal cover memo from a document being sent externally, and trimming an appendix that is not relevant to a particular recipient.",
          "Keep the full original. Deletion produces a new file, but it is easy to overwrite the complete version by accident and find you need it later.",
        ],
      },
      {
        heading: "Related page operations",
        paras: [
          "To keep a section rather than remove one, [Split PDF](/split) extracts a page range. To reorder or rotate at the same time, use [Organize pages](/organize). To add blank pages rather than remove them, [Insert blank pages](/insert-blank).",
        ],
      },
    ],
  },

  "organize": {
    summary:
      "**To organize PDF pages:** add the file, then drag pages into the order you want and rotate or remove any that need it. This is the tool for fixing a document assembled or scanned in the wrong sequence.",
    steps: [
      { title: "Add the PDF", body: "Pages are shown as thumbnails so you can see what you are moving." },
      { title: "Rearrange", body: "Drag pages into position, rotate any that are sideways, and remove ones that are not needed." },
      { title: "Download the reordered document", body: "Pages are copied rather than re-rendered, so quality is unchanged." },
    ],
    sections: [
      {
        heading: "Why scanned documents arrive out of order",
        paras: [
          "Duplex scanners commonly capture all the fronts and then all the backs, producing a file where pages 1, 3, 5 are followed by 2, 4, 6. Sheet feeders also pull pages in reverse, and mixed batches end up with individual sheets rotated.",
          "Fixing this by rescanning is slow. Reordering the pages you already have is usually faster and produces the same result.",
        ],
      },
      {
        heading: "Working on a long document",
        paras: [
          "For a document of a few hundred pages, dragging thumbnails becomes unwieldy. It is often quicker to [split it](/split) into logical sections, fix each one, and [merge](/merge) them back in the right order.",
          "If the document has a bookmark outline, [Split by bookmarks](/split-by-bookmarks) gives you clean section files to work with rather than arbitrary page ranges.",
        ],
      },
      {
        heading: "Finish before you distribute",
        paras: [
          "Reordering after a document has been numbered means the printed numbers no longer match the sequence. Do the reorganising first, then add [page numbers](/add-page-numbers) or [Bates numbering](/bates-numbering) as the final step.",
        ],
      },
    ],
  },

  "watermark": {
    summary:
      "**To watermark a PDF:** add the file, set your text or image, choose the position and opacity, and download. Watermarks mark a document's status — DRAFT, CONFIDENTIAL, a company name — across every page.",
    steps: [
      { title: "Add your PDF", body: "The document is processed in your browser." },
      { title: "Set the watermark", body: "Enter text or supply an image, then set size, angle, position and opacity." },
      { title: "Download", body: "The watermark is applied to the pages you selected." },
    ],
    sections: [
      {
        heading: "Getting the opacity right",
        paras: [
          "A watermark has to be visible without making the document hard to read. Too faint and it is missed, which defeats the point of marking something DRAFT. Too strong and it competes with the text.",
          "A light diagonal watermark across the page centre reads clearly while leaving the text legible. If the document will be printed in black and white, check it in greyscale — a pale colour that looks subtle on screen can disappear entirely in print.",
        ],
      },
      {
        heading: "What a watermark actually protects",
        paras: [
          "A watermark deters casual misuse and makes a document's status unambiguous. It is genuinely useful for marking drafts so an old version is not mistaken for the final one, and for labelling material as confidential.",
          "It is not a security control. Anyone determined can crop it, cover it, or retype the content. If a document must not be read by the wrong person, [password-protect it](/protect); if information must not travel with it, [redact](/redact) that content.",
        ],
      },
      {
        heading: "Applying it at the right time",
        paras: [
          "Watermark after you have finished assembling the document. If you [merge](/merge) files after watermarking, the sections you added later will be unmarked and the result looks careless.",
          "To make a watermark permanent so it cannot be removed as an annotation layer, [flatten the document](/flatten-pdf) afterwards.",
        ],
      },
    ],
  },

  "crop": {
    summary:
      "**To crop a PDF:** add the file, set the area to keep and download. Cropping trims margins and unwanted edges — useful for tightening scans with wide borders, or removing headers and footers before reusing a page.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Set the crop area", body: "Define the region to keep. Apply it to all pages or only some." },
      { title: "Download", body: "The visible page area is reduced to your selection." },
    ],
    sections: [
      {
        heading: "Cropping hides content, it does not delete it",
        paras: [
          "This is the important caveat. Cropping a PDF changes the page's visible boundary, but the content outside that boundary usually remains in the file. It can be recovered by removing the crop, and text in the cropped-out region may still be found by text extraction.",
          "So cropping is fine for tidying margins. It is not a way to remove sensitive information. If something must be gone, use [Redact PDF](/redact), which deletes the content itself.",
        ],
      },
      {
        heading: "When cropping is worth doing",
        paras: [
          "Scanned books and photocopies often carry wide dark margins that waste space and ink. Tightening the crop makes the page more readable on a tablet, where screen area is limited, and produces a cleaner result when the page is reused in another document.",
          "It also helps when a page was scanned at a larger paper size than the content occupies, leaving the text small in the middle of a large white area.",
        ],
      },
      {
        heading: "Cropping versus resizing",
        paras: [
          "Cropping cuts away edges and changes the page's proportions. [Resize PDF](/resize) rescales content to a standard page size such as A4 or Letter without cutting anything. If your aim is consistent printing across a mixed document, resizing is the correct tool.",
        ],
      },
    ],
  },

  "extract-text": {
    summary:
      "**To extract text from a PDF:** add the file and download the content as plain text. Works instantly on text-based PDFs. If the document is a scan, run [OCR](/ocr-pdf) first — there is no text to extract from an image.",
    steps: [
      { title: "Add the PDF", body: "Text is read from the document in your browser." },
      { title: "Extract", body: "The text content is pulled out in reading order." },
      { title: "Download or copy", body: "Save as a text file or copy the content for use elsewhere." },
    ],
    sections: [
      {
        heading: "Reading order is inferred, not stored",
        paras: [
          "A PDF stores text as positioned fragments, not as a continuous flow. Extraction reconstructs the reading order from those positions, which is accurate for single-column documents but can interleave text on complex layouts.",
          "Multi-column academic papers, newsletters and pages with sidebars are the usual trouble spots, where extracted text may jump between columns. Reading the output before relying on it takes a moment and avoids quoting a sentence that never existed.",
        ],
      },
      {
        heading: "A practical use: verifying redaction",
        paras: [
          "Text extraction is the definitive test of whether a redaction actually worked. Redact a document, extract the text, and search for the terms you removed. If they appear, the content was covered rather than deleted and the file is not safe to send.",
          "This same property is why extraction is worth running on any document before it leaves your organisation — it shows you what the file really contains, as opposed to what it displays.",
        ],
      },
      {
        heading: "Related tools",
        paras: [
          "For tabular data, [PDF to Excel](/pdf-to-excel) preserves the row and column structure that plain text loses. For an editable document, [PDF to Word](/pdf-to-word) keeps basic formatting. To count words for a limit, use the [word counter](/word-counter).",
        ],
      },
    ],
  },

  "fill-form": {
    summary:
      "**To fill in a PDF form:** add the document, complete the fields and download. Works with interactive PDF forms and with flat forms that have no real fields, where you can place text where it needs to go.",
    steps: [
      { title: "Add the form", body: "Interactive fields are detected automatically where they exist." },
      { title: "Complete the fields", body: "Type into detected fields, or place text boxes on a flat form that has none." },
      { title: "Sign if required", body: "Many forms need a signature — add one with [Sign PDF](/sign)." },
      { title: "Flatten and send", body: "[Flatten the document](/flatten-pdf) so your entries become fixed page content that cannot be altered or accidentally cleared." },
    ],
    sections: [
      {
        heading: "Interactive forms and flat forms are different",
        paras: [
          "An interactive form has real fields defined in the file; clicking one puts a cursor in it. A flat form is a picture of a form — often a scanned or printed-then-digitised document — with nothing interactive about it, which is why clicking does nothing.",
          "Flat forms are extremely common in practice. The solution is to place text where the field would be rather than trying to fill something that does not exist.",
        ],
      },
      {
        heading: "Always flatten before returning a form",
        paras: [
          "Form field contents remain editable, and some readers will clear or fail to display them. A form that arrives blank because the recipient's software did not render the field values is a common and avoidable problem.",
          "Flattening converts your entries into ordinary page content, so what you see is exactly what the recipient sees. Do this as the final step before sending.",
        ],
      },
      {
        heading: "Handling sensitive form data",
        paras: [
          "Application forms, medical paperwork and financial declarations contain precisely the data you would not want on an unknown server. Everything here is processed in your browser, so the completed form is never transmitted.",
          "If you need to extract data from many completed forms rather than fill one, [Form data extraction](/form-data-extract) pulls field values into a spreadsheet.",
        ],
      },
    ],
  },

  "add-page-numbers": {
    summary:
      "**To add page numbers to a PDF:** add the file, choose the position and starting number, and download. Numbering is written into the page content, so it prints and displays consistently everywhere.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Choose position and format", body: "Pick a corner or centre placement and set the starting number." },
      { title: "Download", body: "Numbers are applied to the pages you selected." },
    ],
    sections: [
      {
        heading: "Number last, not first",
        paras: [
          "Add numbering as the final step after the document is fully assembled. If you number first and then [merge](/merge) in another section or [delete a page](/delete-pages), the printed numbers no longer match the actual sequence, which is worse than having no numbers at all.",
          "The same applies to [reordering](/organize) — finish the arrangement, then number.",
        ],
      },
      {
        heading: "Front matter and starting numbers",
        paras: [
          "Formal documents often should not number the cover page or contents. Setting the start page and the starting value lets the numbering begin on the first page of body text while the earlier pages stay clean.",
          "Be aware this creates a permanent offset between the printed number and the reader's page position, which matters when someone cites a page. State clearly in correspondence which numbering you are referring to.",
        ],
      },
      {
        heading: "Numbering for legal and formal use",
        paras: [
          "For court filings, discovery and evidence bundles, sequential page numbers are usually not sufficient — those require [Bates numbering](/bates-numbering), which supports a prefix, zero padding and a continuous sequence across multiple documents.",
        ],
      },
    ],
  },

  "flatten-pdf": {
    summary:
      "**To flatten a PDF:** add the file and download a version where form fields, annotations and layers become fixed page content. Flattening is how you make a document final — what you see becomes what everyone sees.",
    steps: [
      { title: "Add the PDF", body: "Processed locally in your browser." },
      { title: "Flatten", body: "Interactive fields, comments and layers are merged into the static page." },
      { title: "Download the final document", body: "The result renders identically in every reader." },
    ],
    sections: [
      {
        heading: "Why flattening matters",
        paras: [
          "Form field values and annotations are stored separately from the page content, and not every PDF reader renders them the same way. A completed form can arrive looking blank, or a signature can be dragged out of position, because those elements were still live.",
          "Flattening removes that uncertainty by baking everything into the page. It is the correct final step for any completed form, signed agreement or watermarked document.",
        ],
      },
      {
        heading: "Flattening is one-way",
        paras: [
          "Once flattened, form fields are no longer fillable and annotations can no longer be edited or deleted individually. Keep the unflattened version if you may need to change the entries later.",
          "This permanence is usually the point. It is what stops a counterparty altering the figures in a form you completed, or a signature being repositioned after the fact.",
        ],
      },
      {
        heading: "What flattening does not do",
        paras: [
          "Flattening merges layers; it does not remove information. Content hidden behind an opaque box becomes permanently hidden but may still exist in the file, and document metadata is untouched.",
          "For genuine removal use [Redact PDF](/redact), and run [the metadata sanitiser](/metadata-sanitizer) before sharing anything sensitive.",
        ],
      },
    ],
  },

  "resize": {
    summary:
      "**To resize a PDF:** add the file, choose a target page size such as A4 or Letter, and download. Content is scaled to fit the new dimensions, which is how you make a mixed-format document print consistently.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Choose the page size", body: "Pick a standard size or set custom dimensions." },
      { title: "Download", body: "Every page is scaled to the size you selected." },
    ],
    sections: [
      {
        heading: "A4 and Letter are not the same",
        paras: [
          "A4 is 210 by 297 millimetres; US Letter is 216 by 279. Letter is slightly wider and noticeably shorter. Printing an A4 document on Letter paper without adjustment either crops the bottom or leaves an odd margin, and the mismatch is a routine annoyance in documents shared internationally.",
          "Resizing to the recipient's standard before sending avoids them having to fix it at the printer.",
        ],
      },
      {
        heading: "Mixed page sizes in one document",
        paras: [
          "Documents assembled from several sources often contain a mixture — an A4 report, a Letter invoice, a landscape spreadsheet export. On screen this is tolerable; printed, it produces inconsistent margins and pages that feed awkwardly.",
          "Normalising to one size before printing solves it. Do this after [merging](/merge), so every page is covered.",
        ],
      },
      {
        heading: "Resizing versus cropping",
        paras: [
          "Resizing rescales the content to fit new dimensions, keeping everything on the page. [Cropping](/crop) cuts away the edges instead. If content is being lost, you want resizing; if you are trimming unwanted margin, you want cropping.",
        ],
      },
    ],
  },

};

export function getToolGuide(slug: string): ToolGuideData | null {
  return toolGuides[slug] ?? null;
}

// ---------------------------------------------------------------------------
// Batch 2 — remaining standard tools
// ---------------------------------------------------------------------------

Object.assign(toolGuides, {
  "scan-to-pdf": {
    summary:
      "**To scan to PDF:** photograph or scan your pages, add the images above and download a single tidy PDF. Good capture matters more than any setting here — a straight, evenly lit page produces a document that reads as a scan rather than a snapshot.",
    steps: [
      { title: "Capture the pages", body: "Place the page on a flat contrasting surface in even daylight, hold the camera directly above it, and let it focus before shooting." },
      { title: "Add the images in order", body: "Each image becomes a page, in the order shown." },
      { title: "Download the PDF", body: "One document containing every page." },
      { title: "Make it searchable", body: "Run [OCR](/ocr-pdf) afterwards if you need to search or copy the text." },
    ],
    sections: [
      {
        heading: "The three things that ruin document photos",
        paras: [
          "Shadow across the page, usually from your own head or phone blocking the light. Move so the light comes from the side, or use a window.",
          "Angle. Photographing from off to one side makes the page a trapezoid rather than a rectangle, which looks amateurish and makes OCR less accurate. Position the camera directly over the centre of the page.",
          "Low light, which forces the camera to raise sensitivity and produces grainy output. Daylight near a window beats most indoor lighting, and a grainy capture cannot be repaired afterwards.",
        ],
      },
      {
        heading: "A scan is a picture until you OCR it",
        paras: [
          "The resulting PDF contains images of your pages, so the text cannot be searched, selected or copied. For a receipt you are simply filing, that is fine. For anything you need to find later by keyword, run [OCR PDF](/ocr-pdf) to add a text layer.",
        ],
      },
      {
        heading: "Tidying the result",
        paras: [
          "Pages captured sideways can be fixed with [Rotate](/rotate), out-of-sequence pages with [Organize pages](/organize), and wide dark margins with [Crop](/crop).",
          "Phone cameras produce large files, so a twenty-page scan often exceeds an email limit — [compress it](/compress) before sending.",
        ],
      },
    ],
  },

  "text-to-pdf": {
    summary:
      "**To convert text to PDF:** paste or add your text above and download a formatted PDF. Useful for turning notes, logs, code output or plain-text exports into a document that paginates properly and looks deliberate.",
    steps: [
      { title: "Add your text", body: "Paste directly or add a .txt file." },
      { title: "Convert", body: "The text is laid out onto pages with consistent margins." },
      { title: "Download", body: "A PDF that renders identically on any device." },
    ],
    sections: [
      {
        heading: "Why convert text to PDF at all",
        paras: [
          "A .txt file has no pagination, no margins and no guaranteed font, so it prints unpredictably and looks unfinished when shared. A PDF fixes the layout, which matters when the content is going to a client, an examiner or a records system.",
          "It is also the simplest way to make plain text combinable with other documents — once it is a PDF you can [merge](/merge) it into a larger pack.",
        ],
      },
      {
        heading: "Line breaks and monospaced content",
        paras: [
          "Content that depends on alignment — code, logs, ASCII tables — needs a monospaced font to survive conversion. In a proportional font, columns that lined up in your editor will not line up on the page.",
          "Very long lines wrap rather than running off the page, which is usually what you want but can break the visual structure of tabular text. Check the output if alignment matters.",
        ],
      },
      {
        heading: "After converting",
        paras: [
          "Add [page numbers](/add-page-numbers) for anything long, [protect it](/protect) if the content is sensitive, or [merge](/merge) it with other documents into a single file.",
        ],
      },
    ],
  },

  "html-to-pdf": {
    summary:
      "**To convert HTML to PDF:** provide the page or HTML above and download a fixed-layout PDF. Good for archiving a web page, saving a receipt or invoice from a web app, or producing a printable copy of an online article.",
    steps: [
      { title: "Provide the HTML", body: "Supply the page content to render." },
      { title: "Convert", body: "The page is laid out onto PDF pages." },
      { title: "Check pagination", body: "Web pages have no page breaks, so review where the content divides across pages." },
    ],
    sections: [
      {
        heading: "Web layout does not map cleanly onto paper",
        paras: [
          "A web page is a single continuous scroll of variable width. A PDF is a sequence of fixed pages. Converting means deciding where to cut, and content that assumes infinite vertical space — sticky headers, long tables, elements sized to the viewport — does not always divide gracefully.",
          "Expect to review the output rather than assume it. Tables split across a page boundary are the most common thing to check.",
        ],
      },
      {
        heading: "What will not be captured",
        paras: [
          "Anything that depends on interaction or on loading after the initial render: content behind a login, elements revealed by clicking, lazy-loaded images further down the page, and video or interactive embeds, which become static placeholders.",
          "External stylesheets and fonts that fail to load will change the appearance, so a converted page may look plainer than the original.",
        ],
      },
      {
        heading: "After converting",
        paras: [
          "Archived web pages are often image-heavy — [compress the result](/compress) before emailing. To collect several pages into one archive document, [merge them](/merge).",
        ],
      },
    ],
  },

  "reverse-pdf": {
    summary:
      "**To reverse the page order of a PDF:** add the file above and download a copy with the pages in the opposite sequence. The usual reason is a document scanned back-to-front by a sheet feeder.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Reverse", body: "The last page becomes the first and so on through the document." },
      { title: "Download", body: "Page content and quality are unchanged; only the order differs." },
    ],
    sections: [
      {
        heading: "Why documents come out backwards",
        paras: [
          "Many sheet feeders take pages from the bottom of the stack, so a document loaded face-up scans in reverse. Some duplex scanners produce a similar effect on the reverse side.",
          "Reversing the whole file is a single operation and far faster than rescanning, which is why it is worth checking the page order before you reach for the scanner again.",
        ],
      },
      {
        heading: "When reversing is not the right fix",
        paras: [
          "If a duplex scan produced all the fronts followed by all the backs, the pages are interleaved rather than reversed, and reversing will not fix it. Use [Organize pages](/organize) to place them correctly.",
          "If only a few pages are out of sequence, reordering those individually is safer than reversing the whole document.",
        ],
      },
      {
        heading: "Renumber afterwards",
        paras: [
          "Any page numbering printed on the pages will now run backwards relative to the sequence. If the document carries numbers, apply fresh ones with [Add page numbers](/add-page-numbers) after reversing.",
        ],
      },
    ],
  },

  "insert-blank": {
    summary:
      "**To insert blank pages into a PDF:** add the file, choose where the blank pages go and download. Most often needed to make a document paginate correctly for double-sided printing or binding.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Choose the positions", body: "Insert a blank page after any page, or at intervals through the document." },
      { title: "Download", body: "The blank pages match the size of the surrounding pages." },
    ],
    sections: [
      {
        heading: "Blank pages and double-sided printing",
        paras: [
          "In a duplex-printed document, each new chapter conventionally starts on a right-hand page. If a chapter ends on a right-hand page, a blank is needed so the next one starts correctly — this is why printed books contain occasional blank versos.",
          "The same applies to any document that will be bound or stapled. Getting this right before printing avoids reprinting the whole run.",
        ],
      },
      {
        heading: "Other uses",
        paras: [
          "Adding space for handwritten notes between sections of a handout, separating documents inside a merged pack so each starts cleanly, and reserving a page for a signature or attachment that will be added later.",
        ],
      },
      {
        heading: "Order of operations",
        paras: [
          "Insert blanks after the document is fully assembled, then add [page numbers](/add-page-numbers) last so the numbering accounts for them. If you are preparing a folded booklet, [the booklet creator](/booklet) handles imposition and will add the blanks it needs automatically.",
        ],
      },
    ],
  },

  "word-counter": {
    summary:
      "**To count words in a PDF:** add the file above and get a word, character and page count. Count the PDF you are actually submitting — a Word count and a PDF count often differ once footnotes, captions and references are rendered.",
    steps: [
      { title: "Add the PDF", body: "Text is read from the document in your browser." },
      { title: "Read the counts", body: "Words, characters and pages are reported for the whole document." },
    ],
    sections: [
      {
        heading: "Why counts disagree between Word and PDF",
        paras: [
          "Word processors and PDF extraction count different things. Text boxes, footnotes, endnotes, table cells, headers, footers and image captions may or may not be included depending on the tool, and the difference is easily a few hundred words in a long document.",
          "For a word-limited assignment or submission, the count that matters is the one on the document being assessed. If a limit is strict, leave a margin rather than sitting exactly on the boundary.",
        ],
      },
      {
        heading: "Scanned documents count as zero",
        paras: [
          "If the PDF is a scan, there is no text to count. Run [OCR](/ocr-pdf) first to add a text layer, then count — and bear in mind that recognition errors will affect the total slightly.",
        ],
      },
      {
        heading: "Getting the text itself",
        paras: [
          "To work with the content rather than just measure it, [Extract text](/extract-text) pulls it out as plain text, and [PDF to Word](/pdf-to-word) produces an editable document.",
        ],
      },
    ],
  },

  "annotate": {
    summary:
      "**To annotate a PDF:** add the file, then highlight text and add comments or notes, and download the marked-up copy. This is the tool for reviewing a draft, marking student work or leaving feedback without altering the underlying document.",
    steps: [
      { title: "Add the PDF", body: "The document opens in your browser and is not uploaded." },
      { title: "Mark it up", body: "Highlight passages, add comments and place notes where they are needed." },
      { title: "Download", body: "Annotations are saved into the file for the recipient to see." },
    ],
    sections: [
      {
        heading: "Annotations sit on top of the document",
        paras: [
          "Highlights and comments are stored as a separate layer, not as changes to the page content. That is the point — the original text is untouched, so a reviewer's marks can be distinguished from the author's words.",
          "It also means a recipient can usually move or delete them. If your annotations must be permanent, [flatten the document](/flatten-pdf) before sending, which merges them into the page.",
        ],
      },
      {
        heading: "Not every reader renders annotations the same way",
        paras: [
          "Comment display varies between PDF readers, and some mobile and browser viewers hide them or show them only in a sidebar. If it matters that the recipient sees your marks exactly as you left them, flatten the file first.",
        ],
      },
      {
        heading: "Annotating is not redacting",
        paras: [
          "Drawing a filled box over text with an annotation tool hides it visually while leaving the text in the file, where it can be copied out. For removing information, use [Redact PDF](/redact).",
        ],
      },
    ],
  },

  "metadata": {
    summary:
      "**To edit PDF metadata:** add the file and change the title, author, subject and keywords, then download. Metadata is what document management systems, libraries and search tools read — a correct title is often what appears in a list rather than the filename.",
    steps: [
      { title: "Add the PDF", body: "Existing metadata is read from the file." },
      { title: "Edit the fields", body: "Set the title, author, subject and keywords." },
      { title: "Download", body: "The updated metadata is written into the document." },
    ],
    sections: [
      {
        heading: "Why metadata is worth setting",
        paras: [
          "Many systems display the document title rather than the filename, so a PDF exported from a template can appear in a client's document list as 'Microsoft Word - untitled1'. Setting a proper title avoids that.",
          "Title and author fields also make documents findable in records systems and are used by reference managers when you cite a document.",
        ],
      },
      {
        heading: "Metadata leaks more than people expect",
        paras: [
          "Beyond the fields you can see here, PDFs commonly carry the system username of whoever created the file, the full path it was saved from, the software used, and creation and revision timestamps. Documents converted from Word can also retain comment and revision traces.",
          "Before sending a document outside your organisation, consider whether that information should travel with it. [The metadata sanitiser](/metadata-sanitizer) strips these fields, and [flattening](/flatten-pdf) removes annotation layers.",
        ],
      },
      {
        heading: "Editing is not removal",
        paras: [
          "Changing a field replaces its value; it does not guarantee the previous value is gone from the file's revision history. Where a document is genuinely sensitive, sanitise it rather than editing fields individually.",
        ],
      },
    ],
  },

  "repair-pdf": {
    summary:
      "**To repair a damaged PDF:** add the file and the tool rebuilds what it can of the document structure, recovering readable pages. Recovery depends on how much of the file survived — a truncated download often recovers well, an overwritten file may not.",
    steps: [
      { title: "Add the damaged PDF", body: "Processed in your browser." },
      { title: "Attempt recovery", body: "The document structure is rebuilt and recoverable pages are extracted." },
      { title: "Check what came back", body: "Open the result and confirm which pages survived before discarding the original." },
    ],
    sections: [
      {
        heading: "Why PDFs become unreadable",
        paras: [
          "The most common cause is an incomplete transfer: a download interrupted partway, a file copied from failing storage, or an email attachment truncated in transit. The file then ends mid-structure and readers refuse to open it.",
          "Other causes include a crash while saving, which can leave the cross-reference table inconsistent with the page content, and files damaged by a faulty conversion.",
        ],
      },
      {
        heading: "What recovery can and cannot do",
        paras: [
          "Repair works by rebuilding the index that tells a reader where each object lives. If the page content is intact and only the structure is broken, recovery is usually good.",
          "If part of the file is genuinely missing, that content cannot be reconstructed — nothing can recover data that is not there. Expect partial recovery in that case, and check which pages returned.",
        ],
      },
      {
        heading: "Before you try to repair",
        paras: [
          "Download the file again from the original source if you can. A clean copy is always better than a repaired one, and re-downloading solves the majority of cases faster than repair does.",
          "Keep the damaged original until you have verified the recovered version, in case a different approach works better.",
        ],
      },
    ],
  },

  "pdf-to-pdfa": {
    summary:
      "**To convert a PDF to PDF/A:** add the file and download an archival-standard version. PDF/A is the ISO format required for long-term preservation and for many court, government and institutional submissions, because it guarantees the document will render the same way decades from now.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Convert to PDF/A", body: "Fonts are embedded and features that are not permitted in the archival standard are removed." },
      { title: "Download", body: "An archival copy suitable for submission or long-term storage." },
    ],
    sections: [
      {
        heading: "What PDF/A actually guarantees",
        paras: [
          "A normal PDF can depend on things outside the file — fonts installed on the reader's machine, external content, or software features that may not exist in future. PDF/A forbids that. Everything needed to render the document must be contained inside it, with all fonts embedded.",
          "The result is a document that will display identically in twenty years, which is why archives, courts and regulators require it.",
        ],
      },
      {
        heading: "What gets removed in conversion",
        paras: [
          "Because the standard prohibits external dependencies and active content, conversion strips JavaScript, embedded audio and video, encryption, and links to external files. Transparency and some colour handling may also be adjusted.",
          "This means an interactive form or a multimedia document will lose those capabilities. Keep the original if you still need them; the PDF/A version is for the archive, not for daily use.",
        ],
      },
      {
        heading: "Check the requirement before submitting",
        paras: [
          "PDF/A has several conformance levels, commonly referred to as PDF/A-1, A-2 and A-3, each with variants. Institutions often specify one exactly, so confirm which is required rather than assuming any archival PDF will be accepted.",
        ],
      },
    ],
  },

  "batch": {
    summary:
      "**To process PDFs in bulk:** add multiple files above and apply the same operation to all of them at once. This is for the case where you have twenty documents that each need the same treatment — compressing, rotating, watermarking or protecting.",
    steps: [
      { title: "Add your files", body: "Select as many documents as you need to process." },
      { title: "Choose the operation", body: "The same action is applied consistently across every file." },
      { title: "Download the results", body: "Processed files are returned as a set." },
    ],
    sections: [
      {
        heading: "Batch processing runs on your machine",
        paras: [
          "Because processing is local, throughput depends on your computer rather than on a service quota, and there is no upload time for any of the files. For a large batch of big documents this is dramatically faster than a cloud tool, which must receive every file first.",
          "The corresponding limit is memory. Very large batches of very large files can exhaust the browser tab, so split an unusually big job into two or three passes rather than one.",
        ],
      },
      {
        heading: "Test on one file first",
        paras: [
          "Run the operation on a single representative document and check the result before committing the whole batch. A compression level that turns out too aggressive, or a watermark positioned over the text, is far cheaper to discover on one file than on two hundred.",
        ],
      },
      {
        heading: "Related bulk tools",
        paras: [
          "To apply a consistent naming convention across a set of files, [Bulk rename](/bulk-rename) can derive names from document metadata. To combine the batch into one document instead of processing separately, use [Merge PDF](/merge).",
        ],
      },
    ],
  },

  "chat-pdf": {
    summary:
      "**To chat with a PDF:** add the document and ask questions about its content. Useful for locating where a topic is discussed in a long report, or getting oriented in an unfamiliar document. Verify anything that matters against the source text.",
    steps: [
      { title: "Add the PDF", body: "The document text is read so questions can be answered against it." },
      { title: "Ask your question", body: "Ask where something is covered, or for a summary of a section." },
      { title: "Check the source", body: "Follow the answer back to the relevant pages before relying on it." },
    ],
    sections: [
      {
        heading: "What this is good at, and what it is not",
        paras: [
          "It is genuinely useful for navigation: finding which section of a two-hundred page document discusses a topic, getting the gist of an unfamiliar report, or checking whether a document covers a particular point at all.",
          "It is not a substitute for reading anything consequential. Language models can state something plausible that the document does not say, and they are least reliable on exactly the details people most want to shortcut — figures, dates, obligations and conditions.",
        ],
      },
      {
        heading: "Always verify against the document",
        paras: [
          "Treat an answer as a pointer to where to look, not as the answer itself. For anything contractual, financial, legal or medical, read the relevant passage in the source before acting on it.",
          "If you need the exact wording, [Extract text](/extract-text) gives you the document's real content to check against.",
        ],
      },
      {
        heading: "Scanned documents and privacy",
        paras: [
          "A scanned PDF has no text to read, so run [OCR](/ocr-pdf) first if the document is an image.",
          "Note that unlike the other tools here, answering questions requires sending document text to an AI service, so this feature is not purely local. Avoid using it on material that must not leave your device, and use the offline tools for those documents instead.",
        ],
      },
    ],
  },
});

// ---------------------------------------------------------------------------
// Batch 3 — premium tools
// ---------------------------------------------------------------------------

Object.assign(toolGuides, {
  "pdf-diff": {
    summary:
      "**To compare two PDFs:** add both versions above and every difference is highlighted — added text in green, removed in red, like a code diff. This is how you catch the clause that changed in a returned contract without reading both drafts line by line.",
    steps: [
      { title: "Add both documents", body: "Add the original and the revised version. Both are read in your browser." },
      { title: "Compare", body: "Text is extracted page by page and compared, with differences marked." },
      { title: "Review the changes", body: "Work through the highlighted differences; identical pages can be collapsed out of the way." },
    ],
    sections: [
      {
        heading: "Why manual comparison fails",
        paras: [
          "Reading two long documents side by side reliably misses single-word changes, and those are exactly the ones that matter: 'shall' becoming 'may', thirty days becoming sixty, a liability cap gaining a zero.",
          "A counterparty describing their edits as 'a few small changes' is not being dishonest — they are describing what they consider small. A diff shows you every change and lets you decide which are small.",
        ],
      },
      {
        heading: "What gets compared",
        paras: [
          "Comparison works on the text content of each page, so it finds wording changes, insertions and deletions. It does not detect purely visual changes such as a shifted logo or an altered colour, because those are not text.",
          "Scanned documents contain no text to compare — run [OCR](/ocr-pdf) on both versions first, and be aware that recognition errors can appear as spurious differences.",
        ],
      },
      {
        heading: "Where this is worth building into a process",
        paras: [
          "Contract review, checking a supplier's revised terms, verifying that a signed copy matches the version you approved, tracking manuscript edits between drafts, and confirming a regulatory filing was not altered after sign-off.",
          "Once you have reviewed the changes, [flatten](/flatten-pdf) and [protect](/protect) the agreed version so it cannot drift again.",
        ],
      },
    ],
  },

  "search-redact": {
    summary:
      "**To find and redact a term across a whole PDF:** add the document, enter the word or phrase, and every occurrence is located and removed. This is the reliable way to strip a name or account number from a long production, where visual inspection will eventually miss one.",
    steps: [
      { title: "Add the document", body: "Processed in your browser, which matters for the sensitive files this is used on." },
      { title: "Enter the terms", body: "Specify each word or phrase to remove." },
      { title: "Review the matches", body: "Check what was found before applying, so you do not remove something unintended." },
      { title: "Verify the output", body: "Run [Extract text](/extract-text) on the result and search for the terms to confirm they are gone." },
    ],
    sections: [
      {
        heading: "Why automated search beats reading every page",
        paras: [
          "On a four hundred page production, a human reviewer will miss occurrences. Attention degrades, and a name appearing once in a footnote on page 237 is easy to skip. One missed instance defeats the entire redaction.",
          "Searching finds every instance mechanically. This is the difference between a redaction you can defend and one you hope is complete.",
        ],
      },
      {
        heading: "Search for variants, not just the obvious form",
        paras: [
          "A name appears as 'Jonathan Smith', 'J. Smith', 'Mr Smith' and 'Smith'. An account number may appear with and without spaces or hyphens. An email address contains the name in another form.",
          "List the variants deliberately before you start. Redacting only the full form and leaving the surname throughout the document is a common and serious failure.",
        ],
      },
      {
        heading: "Redaction is only part of the job",
        paras: [
          "Removing text does not remove document metadata, which carries author names, file paths and timestamps — run [the metadata sanitiser](/metadata-sanitizer) as a separate step.",
          "[Flatten the document](/flatten-pdf) as well, so no annotation layer survives holding earlier content, and verify the final file with text extraction before it leaves your organisation.",
        ],
      },
    ],
  },

  "bates-numbering": {
    summary:
      "**To add Bates numbers to a PDF:** add the document, set your prefix, starting number and padding, and every page receives a unique sequential identifier. This is the standard referencing system for legal discovery, exhibits and regulatory productions.",
    steps: [
      { title: "Add the document", body: "Assemble the full production first — numbering should be the final step." },
      { title: "Configure the format", body: "Set the prefix, starting number, zero padding and page position." },
      { title: "Apply and download", body: "Every page is stamped with its unique identifier." },
    ],
    sections: [
      {
        heading: "What Bates numbering is for",
        paras: [
          "In litigation and regulatory work, every page of a production needs a unique, stable reference so that parties can cite an exact page unambiguously. 'ABC-000451' identifies one page across the entire matter, regardless of how documents are later split or recombined.",
          "This is why ordinary [page numbers](/add-page-numbers) are not sufficient: they restart with each document and carry no identifying prefix.",
        ],
      },
      {
        heading: "Choosing a format",
        paras: [
          "Use a prefix that identifies the producing party or matter, and zero-pad the number to a width that comfortably exceeds your expected page count. Padding to six digits sorts correctly in file systems and leaves room to grow; a sequence that overflows its padding sorts incorrectly and causes real confusion later.",
          "Place the number in a bottom corner where it will not overlap document content, and keep the format identical across every production in a matter.",
        ],
      },
      {
        heading: "Number last, and keep a log",
        paras: [
          "Assemble, [reorder](/organize) and [redact](/redact) the production before numbering. Inserting a page after numbering breaks the sequence, and renumbering invalidates any citations already made.",
          "Record which ranges were produced when. If a supplemental production follows, continue the sequence from where the previous one ended rather than restarting.",
        ],
      },
    ],
  },

  "metadata-sanitizer": {
    summary:
      "**To strip hidden data from a PDF:** add the file and download a clean copy with author names, file paths, timestamps and software traces removed. Run this on anything leaving your organisation — the visible content is rarely the only thing a document reveals.",
    steps: [
      { title: "Add the document", body: "Processed in your browser." },
      { title: "Sanitise", body: "Metadata fields and embedded traces are stripped from the file." },
      { title: "Download the clean copy", body: "The visible content is unchanged; what travels with it is not." },
    ],
    sections: [
      {
        heading: "What a PDF reveals beyond its content",
        paras: [
          "Depending on how it was produced, a PDF can carry the author's name and system username, the full file path it was saved from — which often exposes internal folder structures and client names — the software and version used, and creation and modification timestamps.",
          "Documents converted from Word may additionally retain comment threads, tracked changes and earlier revision text. Images embedded from a phone can carry EXIF data including GPS coordinates.",
        ],
      },
      {
        heading: "Why this matters in practice",
        paras: [
          "A timestamp showing a document was created after the deadline it claims to meet. A file path revealing that a proposal to one client was built from another client's template. An author field naming a junior who was not supposed to have handled the matter. These are real disclosures that happen through metadata rather than content.",
          "None of it is visible on screen, which is precisely why it survives review.",
        ],
      },
      {
        heading: "Sanitising is one step of several",
        paras: [
          "Metadata removal does not remove content hidden behind a drawn box — that requires [Redact PDF](/redact) — and does not remove annotation layers, which [flattening](/flatten-pdf) handles.",
          "The reliable order for a sensitive document is: redact the content, flatten the layers, sanitise the metadata, then verify with [Extract text](/extract-text) before sending.",
        ],
      },
    ],
  },

  "split-by-bookmarks": {
    summary:
      "**To split a PDF by its bookmarks:** add the document and each top-level bookmark becomes a separate file. Far more reliable than counting pages when you need chapters or sections extracted from a long document.",
    steps: [
      { title: "Add the PDF", body: "The bookmark outline is read from the document." },
      { title: "Review the sections", body: "Each bookmark defines one output file, named from the bookmark text." },
      { title: "Download the set", body: "One file per section, split at the correct boundaries." },
    ],
    sections: [
      {
        heading: "Why bookmarks beat page ranges",
        paras: [
          "Splitting by page number requires you to find every boundary by hand, and a single miscount shifts everything after it. Bookmarks already encode where each section begins, so the split lands exactly on the chapter boundary.",
          "You also get meaningful filenames from the bookmark text rather than 'pages-41-88', which matters when you are producing dozens of files.",
        ],
      },
      {
        heading: "When there are no bookmarks",
        paras: [
          "Not every PDF has an outline. Scanned documents almost never do, and neither do many exported reports. Check whether your reader shows a bookmarks or contents panel — if it is empty, this tool has nothing to work from.",
          "In that case use [Split PDF](/split) with page ranges, or [Organize pages](/organize) if you also need to rearrange.",
        ],
      },
      {
        heading: "Typical uses",
        paras: [
          "Extracting individual chapters from an ebook or manual, separating a combined regulatory filing back into its constituent documents, breaking an annual report into sections for distribution to different teams, and pulling single exhibits out of a bookmarked litigation bundle.",
        ],
      },
    ],
  },

  "certificate-generator": {
    summary:
      "**To generate certificates in bulk:** upload a template and a CSV of names, and every certificate is produced in one pass. What would take an afternoon of editing and exporting becomes a single operation.",
    steps: [
      { title: "Prepare your list", body: "Export names to CSV from your register or spreadsheet, one row per recipient." },
      { title: "Upload the template", body: "Provide the certificate design with a placeholder where the name goes." },
      { title: "Generate and download", body: "Every certificate is produced with the correct name in place." },
    ],
    sections: [
      {
        heading: "Getting the CSV right",
        paras: [
          "Check spellings before generating, not after. A misspelled name on a certificate is worse than no certificate, and correcting one after printing means regenerating and reprinting.",
          "Watch for names with accented characters, apostrophes and hyphens, which are frequently mangled when exporting from spreadsheets. Confirm the file is saved as UTF-8 so those characters survive.",
        ],
      },
      {
        heading: "Design for the longest name",
        paras: [
          "A layout that looks balanced with 'Ann Lee' can overflow with 'Konstantinos Papadopoulos'. Sort your list by name length and check the longest one renders correctly before running the batch.",
          "Leave generous horizontal space around the name placeholder, and prefer a size that comfortably fits your longest entry rather than one tuned to the average.",
        ],
      },
      {
        heading: "Student and participant names are personal data",
        paras: [
          "A class list or delegate list is personal data under GDPR and equivalent regimes, which is usually what prevents schools and training providers from using free online certificate services.",
          "Here the list is processed in your browser and never uploaded, which removes that obstacle. After generating, [compress](/compress) the output if you are emailing a large batch.",
        ],
      },
    ],
  },

  "booklet": {
    summary:
      "**To make a printable booklet:** add your PDF and the pages are imposed — reordered and paired — so that when the printed sheets are folded and stapled, the content reads in the correct sequence.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Generate the imposition", body: "Pages are paired and reordered for saddle-stitch folding." },
      { title: "Print double-sided and fold", body: "Print on both sides, flipping on the short edge, then fold the stack and staple along the fold." },
    ],
    sections: [
      {
        heading: "What imposition actually does",
        paras: [
          "In a folded booklet, the pages that sit next to each other on a printed sheet are not consecutive. On the outer sheet of an eight-page booklet, page 8 prints beside page 1, and page 2 beside page 7. Fold the stack and the sequence comes out right.",
          "Working this out by hand is error-prone, which is why printing pages in order and folding them produces a booklet that reads out of sequence.",
        ],
      },
      {
        heading: "Page counts must be a multiple of four",
        paras: [
          "Each folded sheet produces four pages, so a saddle-stitched booklet always has a page count divisible by four. If your document does not, blank pages are added to reach the next multiple.",
          "If you would rather control where those blanks fall — at the end, or before a new section — [insert them yourself](/insert-blank) before generating the booklet.",
        ],
      },
      {
        heading: "Printing correctly",
        paras: [
          "Print double-sided, flipping on the short edge. Flipping on the long edge prints alternate pages upside down, which is the most common booklet printing mistake.",
          "Test with a four-page document first to confirm your printer's duplex behaviour before committing a long run to paper.",
        ],
      },
    ],
  },

  "qr-stamp": {
    summary:
      "**To add a QR code to a PDF:** add the document, enter the destination URL, choose the size and position, and stamp it onto the pages you select. Useful for linking a printed document back to an online resource, a payment page or a booking form.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Enter the URL", body: "Provide the destination the code should open." },
      { title: "Position and stamp", body: "Set size and placement, choose which pages, and download." },
      { title: "Scan it before printing", body: "Test the code with an actual phone camera on the final PDF." },
    ],
    sections: [
      {
        heading: "Size and contrast determine whether it scans",
        paras: [
          "A QR code needs enough physical size to be read. As a working rule, keep it at least two centimetres square for a code scanned from close range, and larger for anything read at a distance such as a poster.",
          "It also needs a quiet margin of clear space around it and strong contrast. Codes placed over patterned backgrounds, printed too small to save space, or crowded against text are the usual reasons a code fails to scan.",
        ],
      },
      {
        heading: "Always test the final file",
        paras: [
          "Scan the code from the actual output PDF with a real phone before printing hundreds of copies. Test the printed version too — a code that scans perfectly on screen can fail on paper if the print is light or the paper is glossy.",
          "Check the URL opens correctly on mobile as well. A link to a page that is unusable on a phone defeats the purpose.",
        ],
      },
      {
        heading: "Practical uses",
        paras: [
          "Linking a printed invoice to an online payment page, adding a booking link to a flyer, connecting a printed manual to a video tutorial, or pointing an event programme at a feedback form.",
          "Use a stable URL. If the destination might move, use a redirect you control rather than a direct link, since a printed code cannot be edited afterwards.",
        ],
      },
    ],
  },

  "pdf-to-audio": {
    summary:
      "**To convert a PDF to audio:** add the document and it is read aloud using text-to-speech, with the option to download the audio. Useful for reviewing a report while commuting, proofreading by ear, or making documents accessible.",
    steps: [
      { title: "Add the PDF", body: "Text is read from the document." },
      { title: "Choose voice and speed", body: "Select a voice and adjust the reading rate to something comfortable." },
      { title: "Listen or download", body: "Play it directly or save the audio for offline listening." },
    ],
    sections: [
      {
        heading: "Proofreading by ear catches different mistakes",
        paras: [
          "Hearing your own writing read aloud surfaces problems that reading silently hides: repeated words, sentences that run too long, clumsy phrasing and missing connectives. Your eye skips over what it expects to see; your ear does not.",
          "This is a genuinely effective final check on anything important before it goes out.",
        ],
      },
      {
        heading: "What does not read well",
        paras: [
          "Text-to-speech follows the extracted reading order, so multi-column layouts, sidebars and text boxes can be read in a confusing sequence. Tables become a stream of numbers with no structure, and equations, code and heavy abbreviation do not translate to speech usefully.",
          "Straightforward prose — reports, articles, letters, chapters — works best.",
        ],
      },
      {
        heading: "Scanned documents need OCR first",
        paras: [
          "If there is no selectable text in the PDF, there is nothing to read aloud. Run [OCR](/ocr-pdf) first, and expect recognition errors to be audible as odd words — a mangled character that is easy to overlook on screen becomes obvious when spoken.",
          "For a cleaner result on a long document, [extract the text](/extract-text) first and remove headers, footers and page numbers, which otherwise interrupt the reading every page.",
        ],
      },
    ],
  },

  "pdf-inverter": {
    summary:
      "**To invert PDF colours:** add the file and switch it to dark mode, greyscale or higher contrast. Dark backgrounds with light text are considerably easier on the eyes when reading for long periods on a screen at night.",
    steps: [
      { title: "Add the PDF", body: "Processed in your browser." },
      { title: "Choose the mode", body: "Invert to dark, convert to greyscale, or adjust contrast." },
      { title: "Download", body: "The converted document, ready for reading or printing." },
    ],
    sections: [
      {
        heading: "Dark mode for long reading sessions",
        paras: [
          "A standard PDF is a bright white page, which is fatiguing to read on a screen in a dim room. Inverting to light text on a dark background reduces that considerably, and unlike a reader's built-in night mode, the change is saved into the file so it works in any viewer and on any device.",
        ],
      },
      {
        heading: "Greyscale before printing",
        paras: [
          "Converting to greyscale before printing on a monochrome printer gives you control over how colours translate. Left to the printer, two distinct colours in a chart can come out as near-identical greys, making the chart unreadable.",
          "Converting first also lets you check that coloured text remains legible and that any colour-coded key still makes sense in black and white.",
        ],
      },
      {
        heading: "Watch what happens to images",
        paras: [
          "Inversion applies to the whole page, so photographs and diagrams become negatives, which is usually undesirable. It works best on text-only documents.",
          "For scanned pages, increasing contrast is often more useful than inverting — it darkens faint text and lightens a grey background, improving legibility and [OCR](/ocr-pdf) accuracy at the same time.",
        ],
      },
    ],
  },

  "form-data-extract": {
    summary:
      "**To extract data from PDF forms:** add one or more completed forms and the field values are pulled into a CSV or spreadsheet. Reading values from form fields is far more reliable than trying to extract them from the printed page.",
    steps: [
      { title: "Add the completed forms", body: "Add a single form or a batch of them." },
      { title: "Extract", body: "Field names and their values are read from each document." },
      { title: "Download as CSV", body: "One row per form, one column per field, ready for a spreadsheet." },
    ],
    sections: [
      {
        heading: "Field extraction versus reading the page",
        paras: [
          "An interactive PDF form stores each answer as a named value inside the file. Reading those values directly gives you exactly what was entered, correctly associated with the right question.",
          "Trying to get the same data by extracting page text means inferring which text belongs to which label from position on the page, which is fragile. If the form has real fields, always extract from the fields.",
        ],
      },
      {
        heading: "Flat forms will not work",
        paras: [
          "A scanned or printed-then-digitised form has no fields — it is an image of a form. There are no values to read, so extraction returns nothing.",
          "For those, run [OCR](/ocr-pdf) and extract text, accepting that mapping answers to questions will need manual checking. Handwritten entries are a further problem that OCR handles poorly.",
        ],
      },
      {
        heading: "Batch processing surveys and applications",
        paras: [
          "The real value is in volume: fifty completed application forms become fifty spreadsheet rows in one operation instead of fifty manual transcriptions, with none of the transcription errors.",
          "Because forms of this kind usually contain personal data, note that processing happens in your browser and no form is uploaded.",
        ],
      },
    ],
  },

  "bulk-rename": {
    summary:
      "**To rename PDFs in bulk:** add your files and build a naming pattern from document metadata such as title, author or date. Turns a folder of 'scan_0001.pdf' into consistently named, findable documents.",
    steps: [
      { title: "Add the files", body: "Add the whole set you want renamed." },
      { title: "Build a pattern", body: "Compose a filename from metadata fields and fixed text." },
      { title: "Review and download", body: "Check the proposed names before applying, then download the renamed set." },
    ],
    sections: [
      {
        heading: "Naming conventions that actually help",
        paras: [
          "Start filenames with an ISO date, written as YYYY-MM-DD. This is the only common date format that sorts chronologically when sorted alphabetically, which means your file browser does the organising for you.",
          "Follow it with a document type and an identifier, for example '2026-03-14-invoice-acme-0042.pdf'. Avoid spaces and special characters, which cause problems in URLs, scripts and some records systems.",
        ],
      },
      {
        heading: "Metadata quality determines the result",
        paras: [
          "Renaming from metadata only works if the metadata is present and correct. Many scanned documents have no title at all, and templates frequently carry the wrong one — which is how files end up named after 'Microsoft Word - untitled1'.",
          "Check what the documents actually contain first, and use [the metadata editor](/metadata) to fix titles before renaming if needed.",
        ],
      },
      {
        heading: "Always review before applying",
        paras: [
          "Look at the proposed names before committing. Renaming a large batch incorrectly is tedious to reverse, particularly if two documents end up with the same name.",
          "Keep the originals until you have confirmed the renamed set is correct.",
        ],
      },
    ],
  },

  "vault": {
    summary:
      "**PDF Vault** stores documents in your browser's local storage on this device, so they are available when you return without being held on any server. Treat it as convenient local storage, not as a backup or a secure archive.",
    steps: [
      { title: "Add documents", body: "Files are kept in this browser's local storage on this device." },
      { title: "Access them later", body: "They remain available when you come back in the same browser." },
      { title: "Keep your own backups", body: "Store the authoritative copy somewhere you control." },
    ],
    sections: [
      {
        heading: "Understand where your files actually are",
        paras: [
          "Documents are held in this browser's storage on this computer. They are not uploaded to a server, which means nobody else can access them remotely — and equally, they are not backed up anywhere.",
          "They are tied to this browser on this device. They will not appear in another browser, on your phone, or in a private browsing window.",
        ],
      },
      {
        heading: "How you can lose them",
        paras: [
          "Clearing your browsing data will delete them. So will 'clear cookies and site data', many privacy cleanup tools, and some browsers' automatic storage eviction when disk space runs low. Reinstalling the browser or resetting the device removes them too.",
          "For that reason, never keep the only copy of an important document here. Always keep the authoritative version in your own file storage or backup.",
        ],
      },
      {
        heading: "What it is genuinely useful for",
        paras: [
          "Documents you return to repeatedly during a piece of work, so you do not have to locate and re-add them each session. A working set rather than an archive.",
          "For documents that need real protection, [password-protect them](/protect) and store them in your own backed-up storage. For sensitive material you are about to share, [sanitise the metadata](/metadata-sanitizer) first.",
        ],
      },
    ],
  },
});
