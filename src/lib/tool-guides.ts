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

  "compress-note": {
    summary: "",
    sections: [],
  },
};

export function getToolGuide(slug: string): ToolGuideData | null {
  return toolGuides[slug] ?? null;
}
