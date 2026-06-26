$schemaScript = "C:\Users\saqib\web app\pdf-tools\add-schema.ps1"
$baseDir = "C:\Users\saqib\web app\pdf-tools\src\app"

$importBlock = @"
import HowToJsonLd from "@/components/HowToJsonLd";
import AiSummaryJsonLd from "@/components/AiSummaryJsonLd";
"@

$tools = @(
  # --- FREE TOOLS ---
  @{
    dir = "compress"
    howto = '<HowToJsonLd name="Compress PDF Online Free" description="Reduce PDF file size without losing quality" steps={[{name:"Upload PDF",text:"Select the PDF file you want to compress"},{name:"Choose compression level",text:"Select compression level low medium or high"},{name:"Download compressed PDF",text:"Download your smaller PDF file"}]} />'
    ai = '<AiSummaryJsonLd name="Compress PDF" summary="Reduce PDF file size instantly without losing quality" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Lossless compression","Size reduction","Quality preservation","Instant processing","No uploads"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "merge"
    howto = '<HowToJsonLd name="Merge PDF Files Online" description="Combine multiple PDF files into a single document" steps={[{name:"Upload PDFs",text:"Select two or more PDF files to merge"},{name:"Arrange order",text:"Drag and drop files to set the desired order"},{name:"Download merged PDF",text:"Download the combined single PDF document"}]} />'
    ai = '<AiSummaryJsonLd name="Merge PDF" summary="Combine multiple PDF documents into one file with customizable page order" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file merging","Order customization","Drag-and-drop","Free processing","No file uploads"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "split"
    howto = '<HowToJsonLd name="Split PDF Pages Online" description="Separate PDF pages into multiple files or extract specific pages" steps={[{name:"Upload PDF",text:"Select the PDF file to split"},{name:"Choose split method",text:"Select page ranges or split every page"},{name:"Download split files",text:"Download the individual PDF files"}]} />'
    ai = '<AiSummaryJsonLd name="Split PDF" summary="Separate PDF pages into multiple documents or extract specific page ranges" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page range extraction","Split every page","Multiple output files","Client-side processing","Free"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "image-to-pdf"
    howto = '<HowToJsonLd name="Convert Image to PDF" description="Convert JPG PNG and other images to PDF documents" steps={[{name:"Upload images",text:"Select one or more images JPG PNG BMP WebP"},{name:"Arrange order",text:"Drag to reorder images as needed"},{name:"Download PDF",text:"Download your images combined into a PDF"}]} />'
    ai = '<AiSummaryJsonLd name="Image to PDF" summary="Convert images JPG PNG BMP to PDF documents with customizable page layout" category="Graphics" inputType="Image" outputType="PDF" processing="client-side" price="free" features={["Image to PDF conversion","Multi-image support","Page orientation","Free online tool","Client-side only"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "pdf-to-images"
    howto = '<HowToJsonLd name="Convert PDF to Images" description="Extract PDF pages as high-quality JPG or PNG images" steps={[{name:"Upload PDF",text:"Select the PDF to convert to images"},{name:"Choose format",text:"Select JPG or PNG output format"},{name:"Download images",text:"Download individual page images or a ZIP archive"}]} />'
    ai = '<AiSummaryJsonLd name="PDF to Images" summary="Convert PDF pages to high-quality JPG or PNG images" category="Graphics" inputType="PDF" outputType="Image" processing="client-side" price="free" features={["Page extraction","JPG PNG output","High quality","ZIP download","Free browser tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "protect"
    howto = '<HowToJsonLd name="Password Protect PDF" description="Add password protection to encrypt PDF files" steps={[{name:"Upload PDF",text:"Select the PDF file to protect"},{name:"Set password",text:"Enter a strong password for encryption"},{name:"Download protected PDF",text:"Download your password-encrypted PDF document"}]} />'
    ai = '<AiSummaryJsonLd name="Password Protect PDF" summary="Encrypt PDF files with password protection to prevent unauthorized access" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Password encryption","AES security","User password","Owner password","Client-side only"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "redact"
    howto = '<HowToJsonLd name="Redact PDF Online" description="Permanently black out sensitive content in PDF files" steps={[{name:"Upload PDF",text:"Select the PDF with content to redact"},{name:"Select areas to redact",text:"Draw black boxes over sensitive text and images"},{name:"Download redacted PDF",text:"Download the PDF with permanently removed content"}]} />'
    ai = '<AiSummaryJsonLd name="Redact PDF" summary="Permanently black out sensitive text images and areas in PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Area redaction","Text blackout","Permanent removal","Client-side","No server uploads"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "annotate"
    howto = '<HowToJsonLd name="Annotate PDF Online" description="Highlight underline strikethrough and add comments to PDFs" steps={[{name:"Upload PDF",text:"Select the PDF document to annotate"},{name:"Add annotations",text:"Highlight text underline or strikethrough content"},{name:"Download annotated PDF",text:"Download the PDF with your annotations saved"}]} />'
    ai = '<AiSummaryJsonLd name="Annotate PDF" summary="Add highlights underlines strikethroughs and comments to PDF documents" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Highlight text","Underline text","Strikethrough","Comment notes","Free browser tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "unlock"
    howto = '<HowToJsonLd name="Unlock PDF Online" description="Remove password protection from PDF files" steps={[{name:"Upload PDF",text:"Select the password-protected PDF"},{name:"Enter password",text:"Type the PDF owner or user password"},{name:"Download unlocked PDF",text:"Download the PDF with password protection removed"}]} />'
    ai = '<AiSummaryJsonLd name="Unlock PDF" summary="Remove password protection from PDF files to access and edit content freely" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Password removal","Owner password unlock","User password unlock","Free tool","Client-side only"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "watermark"
    howto = '<HowToJsonLd name="Add Watermark to PDF" description="Add text or image watermarks to every page of a PDF" steps={[{name:"Upload PDF",text:"Select the PDF to watermark"},{name:"Customize watermark",text:"Enter text adjust opacity size and position"},{name:"Download watermarked PDF",text:"Download the PDF with watermarks applied"}]} />'
    ai = '<AiSummaryJsonLd name="Watermark PDF" summary="Add custom text watermarks to every page of PDF documents" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Text watermark","Opacity control","Position selection","Batch watermarking","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "sign"
    howto = '<HowToJsonLd name="Sign PDF Online" description="Add electronic signatures to PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF document to sign"},{name:"Draw signature",text:"Draw type or upload your signature"},{name:"Place and download",text:"Position your signature and download the signed PDF"}]} />'
    ai = '<AiSummaryJsonLd name="Sign PDF" summary="Add electronic signatures to PDF documents by drawing typing or uploading" category="BusinessApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Draw signature","Type signature","Upload signature","Position placement","Free e-sign tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "extract-text"
    howto = '<HowToJsonLd name="Extract Text from PDF" description="Copy text content from scanned or digital PDF files" steps={[{name:"Upload PDF",text:"Select the PDF to extract text from"},{name:"Extract text",text:"The tool reads all text content from the document"},{name:"Copy or download",text:"Copy text to clipboard or download as TXT file"}]} />'
    ai = '<AiSummaryJsonLd name="Extract Text" summary="Extract and copy text content from scanned or digital PDF documents" category="Utilities" inputType="PDF" outputType="Text" processing="client-side" price="free" features={["Text extraction","OCR support","TXT export","Clipboard copy","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "rotate"
    howto = '<HowToJsonLd name="Rotate PDF Pages" description="Rotate PDF pages by 90 180 or 270 degrees" steps={[{name:"Upload PDF",text:"Select the PDF with pages to rotate"},{name:"Select rotation",text:"Choose 90 180 or 270 degree rotation"},{name:"Download rotated PDF",text:"Download the PDF with corrected page orientation"}]} />'
    ai = '<AiSummaryJsonLd name="Rotate PDF" summary="Rotate PDF pages by 90 180 or 270 degrees to fix orientation issues" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page rotation","90 180 270 degrees","Orientation fix","Free online tool","Client-side only"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "resize"
    howto = '<HowToJsonLd name="Resize PDF Pages" description="Change PDF page size to A4 Letter Legal or custom dimensions" steps={[{name:"Upload PDF",text:"Select the PDF to resize"},{name:"Choose page size",text:"Select A4 Letter Legal or enter custom dimensions"},{name:"Download resized PDF",text:"Download the PDF with new page dimensions"}]} />'
    ai = '<AiSummaryJsonLd name="Resize PDF" summary="Change PDF page dimensions to standard sizes like A4 Letter Legal or custom" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page resizing","A4 Letter Legal","Custom dimensions","Free browser tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "crop"
    howto = '<HowToJsonLd name="Crop PDF Online" description="Remove unwanted margins and whitespace from PDF pages" steps={[{name:"Upload PDF",text:"Select the PDF to crop"},{name:"Set margins",text:"Adjust crop margins for each side of the page"},{name:"Download cropped PDF",text:"Download the PDF with trimmed page content"}]} />'
    ai = '<AiSummaryJsonLd name="Crop PDF" summary="Remove unwanted margins and whitespace from PDF pages" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Margin cropping","Whitespace removal","Page trimming","Free online tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "delete-pages"
    howto = '<HowToJsonLd name="Delete PDF Pages" description="Remove unwanted pages from PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF with pages to remove"},{name:"Select pages to delete",text:"Choose specific pages or page ranges to remove"},{name:"Download PDF",text:"Download the PDF with selected pages removed"}]} />'
    ai = '<AiSummaryJsonLd name="Delete Pages" summary="Remove unwanted specific pages or page ranges from PDF documents" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page deletion","Range selection","Multiple page removal","Free tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "text-to-pdf"
    howto = '<HowToJsonLd name="Convert Text to PDF" description="Convert plain text to formatted PDF documents" steps={[{name:"Enter or paste text",text:"Type or paste your text content"},{name:"Choose formatting",text:"Select font size and page layout"},{name:"Download PDF",text:"Download your text as a formatted PDF document"}]} />'
    ai = '<AiSummaryJsonLd name="Text to PDF" summary="Convert plain text content into formatted PDF documents" category="Utilities" inputType="Text" outputType="PDF" processing="client-side" price="free" features={["Text conversion","Font selection","Page formatting","Free online tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "organize"
    howto = '<HowToJsonLd name="Organize PDF Pages" description="Reorder drag-and-drop rearrange pages in PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF to reorganize"},{name:"Drag to reorder",text:"Drag and drop page thumbnails to rearrange"},{name:"Download organized PDF",text:"Download the PDF with reorganized page order"}]} />'
    ai = '<AiSummaryJsonLd name="Organize PDF" summary="Reorder pages in PDF documents with drag-and-drop interface" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page reordering","Drag-and-drop","Thumbnail preview","Free tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "metadata"
    howto = '<HowToJsonLd name="Edit PDF Metadata" description="View and edit PDF document properties title author subject keywords" steps={[{name:"Upload PDF",text:"Select the PDF to edit metadata"},{name:"Edit properties",text:"Update title author subject and keywords"},{name:"Download updated PDF",text:"Download the PDF with new metadata"}]} />'
    ai = '<AiSummaryJsonLd name="Metadata Editor" summary="View and edit PDF document properties including title author subject and keywords" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Title editing","Author editing","Subject editing","Keyword editing","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "word-counter"
    howto = '<HowToJsonLd name="PDF Word Counter" description="Count words characters pages in PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF to analyze"},{name:"View statistics",text:"See word count character count and page count"},{name:"Copy results",text:"Copy statistics to clipboard for reporting"}]} />'
    ai = '<AiSummaryJsonLd name="Word Counter" summary="Count words characters pages and paragraphs in PDF documents" category="Utilities" inputType="PDF" outputType="Statistics" processing="client-side" price="free" features={["Word count","Character count","Page count","Paragraph count","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "insert-blank"
    howto = '<HowToJsonLd name="Insert Blank Pages in PDF" description="Add empty pages to any PDF document at specific positions" steps={[{name:"Upload PDF",text:"Select the PDF to add blank pages to"},{name:"Set position and count",text:"Choose where to insert blank pages and how many"},{name:"Download updated PDF",text:"Download the PDF with blank pages inserted"}]} />'
    ai = '<AiSummaryJsonLd name="Insert Blank Pages" summary="Add empty blank pages to PDF documents at any position" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Blank page insertion","Position control","Multiple pages","Free online tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "pdf-to-excel"
    howto = '<HowToJsonLd name="Convert PDF to Excel" description="Extract tables from PDF files to Excel CSV spreadsheets" steps={[{name:"Upload PDF",text:"Select the PDF with tables to extract"},{name:"Review extracted data",text:"Preview the extracted table data"},{name:"Download CSV",text:"Download the extracted data as a spreadsheet file"}]} />'
    ai = '<AiSummaryJsonLd name="PDF to Excel" summary="Extract table data from PDF files to Excel CSV format" category="BusinessApplications" inputType="PDF" outputType="CSV" processing="client-side" price="free" features={["Table extraction","CSV export","Data preview","Free tool","Client-side"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "add-page-numbers"
    howto = '<HowToJsonLd name="Add Page Numbers to PDF" description="Insert page numbers at any position in PDF documents" steps={[{name:"Upload PDF",text:"Select the PDF to add page numbers"},{name:"Customize numbering",text:"Choose position style and starting number"},{name:"Download numbered PDF",text:"Download the PDF with page numbers added"}]} />'
    ai = '<AiSummaryJsonLd name="Add Page Numbers" summary="Insert page numbers into PDF documents with customizable position and formatting" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page numbering","Position selection","Custom start number","Style options","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "html-to-pdf"
    howto = '<HowToJsonLd name="Convert HTML to PDF" description="Convert HTML markup and web pages to PDF documents" steps={[{name:"Enter HTML",text:"Paste HTML code or enter a URL"},{name:"Preview",text:"Preview how the PDF will look"},{name:"Download PDF",text:"Download the HTML content as a PDF document"}]} />'
    ai = '<AiSummaryJsonLd name="HTML to PDF" summary="Convert HTML markup and web page URLs into PDF documents" category="Utilities" inputType="HTML" outputType="PDF" processing="client-side" price="free" features={["HTML conversion","URL to PDF","Preview","Free tool","Client-side processing"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "batch"
    howto = '<HowToJsonLd name="Batch Process PDF Files" description="Process multiple PDF files at once with the same operation" steps={[{name:"Upload PDFs",text:"Select multiple PDF files to process"},{name:"Choose operation",text:"Select compress merge split or other batch operation"},{name:"Download results",text:"Download all processed files individually or as ZIP"}]} />'
    ai = '<AiSummaryJsonLd name="Batch Process" summary="Process multiple PDF files simultaneously applying the same operation to all" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Multi-file batch","Same operation","Compress merge split","ZIP download","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "chat-pdf"
    howto = '<HowToJsonLd name="Chat with PDF AI" description="Upload a PDF and ask AI questions about its content" steps={[{name:"Upload PDF",text:"Select a PDF document to analyze"},{name:"Ask questions",text:"Type questions about the content in natural language"},{name:"Get answers",text:"Receive AI-generated answers based on the document content"}]} />'
    ai = '<AiSummaryJsonLd name="Chat with PDF" summary="Upload a PDF document and ask AI-powered questions about its content" category="AIApplications" inputType="PDF" outputType="Answers" processing="server-side" price="free" features={["AI-powered QandA","Natural language","Document analysis","Free daily limit","No signup"]} limits="Free daily limit" />'
  }
  @{
    dir = "fill-form"
    howto = '<HowToJsonLd name="Fill PDF Form Online" description="Complete interactive PDF form fields text checkboxes dropdowns" steps={[{name:"Upload PDF form",text:"Select a PDF with interactive form fields"},{name:"Fill in fields",text:"Complete text fields checkboxes and dropdowns"},{name:"Download filled form",text:"Download the completed PDF form"}]} />'
    ai = '<AiSummaryJsonLd name="Fill PDF Form" summary="Fill interactive PDF form fields including text checkboxes radio buttons and dropdowns" category="BusinessApplications" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Form filling","Checkboxes","Dropdowns","Radio buttons","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "flatten-pdf"
    howto = '<HowToJsonLd name="Flatten PDF Online" description="Merge form fields annotations and layers into permanent page content" steps={[{name:"Upload PDF",text:"Select the PDF with form fields or layers to flatten"},{name:"Flatten document",text:"The tool merges all interactive elements into page content"},{name:"Download flattened PDF",text:"Download the PDF with permanently flattened content"}]} />'
    ai = '<AiSummaryJsonLd name="Flatten PDF" summary="Merge form fields annotations and layers into permanent PDF page content" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Form flattening","Annotation merge","Layer flattening","Permanent content","Free tool"]} limits="Files up to 10MB" />'
  }
  @{
    dir = "reverse-pdf"
    howto = '<HowToJsonLd name="Reverse PDF Page Order" description="Flip the entire page sequence of any PDF document" steps={[{name:"Upload PDF",text:"Select the PDF to reverse"},{name:"Reverse pages",text:"The tool reverses the entire page order"},{name:"Download reversed PDF",text:"Download the PDF with pages in reversed order"}]} />'
    ai = '<AiSummaryJsonLd name="Reverse PDF Order" summary="Reverse the complete page sequence of PDF documents" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="free" features={["Page reversal","Full document","Quick processing","Free tool","Client-side"]} limits="Files up to 10MB" />'
  }
  # --- PREMIUM TOOLS ---
  @{
    dir = "pdf-diff"
    howto = '<HowToJsonLd name="Compare PDF Files Online" description="Compare two PDF documents side by side and see highlighted differences" steps={[{name:"Upload original PDF",text:"Drag and drop or select the older version of your PDF document"},{name:"Upload revised PDF",text:"Select the newer version you want to compare against"},{name:"View differences",text:"The tool processes both files and shows highlighted changes green for added red for removed content"}]} />'
    ai = '<AiSummaryJsonLd name="PDF Diff" summary="Compare two PDF files side by side with highlighted text differences" category="Multimedia" inputType="PDF" outputType="Diff" processing="client-side" price="premium" features={["Side-by-side comparison","Highlighted additions and deletions","Synchronized scrolling","Client-side processing","No file uploads"]} limits="Premium subscribers" />'
  }
  @{
    dir = "certificate-generator"
    howto = '<HowToJsonLd name="Generate PDF Certificates in Bulk" description="Create personalized PDF certificates in bulk from a template and CSV data" steps={[{name:"Upload certificate template",text:"Upload your PDF certificate template with placeholder fields"},{name:"Upload CSV data",text:"Upload a CSV file with participant names and details"},{name:"Generate certificates",text:"The tool merges data into the template and generates individual PDF certificates"}]} />'
    ai = '<AiSummaryJsonLd name="Certificate Generator" summary="Bulk-generate personalized PDF certificates from a template and CSV data" category="BusinessApplications" inputType="PDF+CSV" outputType="PDF" processing="client-side" price="premium" features={["Bulk certificate generation","CSV data merge","Customizable templates","Batch processing","Client-side rendering"]} limits="Premium subscribers" />'
  }
  @{
    dir = "pdf-to-audio"
    howto = '<HowToJsonLd name="Convert PDF to Audio" description="Convert any PDF document to spoken audio with text-to-speech" steps={[{name:"Upload PDF",text:"Select a PDF document with text content"},{name:"Choose voice and speed",text:"Select from available voices and adjust playback speed"},{name:"Listen or download",text:"Play the audio directly in your browser or download as an audio file"}]} />'
    ai = '<AiSummaryJsonLd name="PDF to Audio" summary="Convert PDF documents to spoken audio using text-to-speech technology with customizable voices" category="MediaApplications" inputType="PDF" outputType="Audio" processing="client-side" price="premium" features={["Text-to-speech conversion","Multiple voice options","Speed control","Play/pause/stop controls","No server uploads"]} limits="Premium subscribers" />'
  }
  @{
    dir = "form-data-extract"
    howto = '<HowToJsonLd name="Extract PDF Form Data to CSV" description="Extract filled form field data from PDF forms and export to CSV" steps={[{name:"Upload PDF form",text:"Upload a PDF with interactive form fields AcroForms or XFA"},{name:"Extract data",text:"The tool reads all form fields and extracts their values"},{name:"Download CSV",text:"Download the extracted data as a CSV file for analysis"}]} />'
    ai = '<AiSummaryJsonLd name="Form Data Extraction" summary="Extract field values from PDF forms and export them to CSV format" category="BusinessApplications" inputType="PDF" outputType="CSV" processing="client-side" price="premium" features={["AcroForm extraction","CSV export","Batch processing","Field name mapping","No data uploads"]} limits="Premium subscribers" />'
  }
  @{
    dir = "bulk-rename"
    howto = '<HowToJsonLd name="Bulk Rename PDF Files" description="Rename multiple PDFs at once using their embedded metadata" steps={[{name:"Upload PDF files",text:"Select multiple PDF files to rename"},{name:"Choose naming pattern",text:"Select metadata fields like title author or page count as naming pattern"},{name:"Apply new names",text:"Download files with new names based on your pattern"}]} />'
    ai = '<AiSummaryJsonLd name="Bulk Rename" summary="Rename multiple PDF files simultaneously using embedded metadata fields" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Metadata-based renaming","Batch processing","Custom naming patterns","Title author page count extraction","Client-side only"]} limits="Premium subscribers" />'
  }
  @{
    dir = "booklet"
    howto = '<HowToJsonLd name="Create PDF Booklet" description="Convert any PDF into a printable booklet with various layouts" steps={[{name:"Upload PDF",text:"Upload the PDF you want to convert to a booklet"},{name:"Choose layout",text:"Select side-by-side 2x2 grid or 4x4 grid layout"},{name:"Download booklet",text:"Download the formatted PDF ready for printing and binding"}]} />'
    ai = '<AiSummaryJsonLd name="Booklet Creator" summary="Convert PDFs into printable booklets with configurable N-up layouts" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Booklet formatting","N-up layouts 2x2 4x4","Saddle-stitch ready","Side-by-side pages","Print optimization"]} limits="Premium subscribers" />'
  }
  @{
    dir = "search-redact"
    howto = '<HowToJsonLd name="Search and Redact PDF" description="Automatically find and redact specific words or phrases across a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document you want to redact"},{name:"Enter search terms",text:"Type the words or phrases you want to find and redact"},{name:"Download redacted PDF",text:"Download the PDF with all matching content permanently blacked out"}]} />'
    ai = '<AiSummaryJsonLd name="Search and Redact" summary="Auto-find and permanently redact specific words phrases or patterns across entire PDF documents" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Auto-search and redact","Batch redaction","Phrase matching","Permanent removal","Client-side processing"]} limits="Premium subscribers" />'
  }
  @{
    dir = "pdf-inverter"
    howto = '<HowToJsonLd name="Invert PDF Colors" description="Transform PDF colors to dark mode grayscale or high-contrast" steps={[{name:"Upload PDF",text:"Upload the PDF you want to transform"},{name:"Choose color mode",text:"Select dark mode grayscale or high-contrast"},{name:"Download transformed PDF",text:"Download the PDF with new color scheme applied"}]} />'
    ai = '<AiSummaryJsonLd name="Color Inverter" summary="Transform PDF color schemes to dark mode grayscale or high-contrast for accessibility" category="Graphics" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Dark mode conversion","Grayscale conversion","High-contrast mode","Accessibility features","Client-side rendering"]} limits="Premium subscribers" />'
  }
  @{
    dir = "vault"
    howto = '<HowToJsonLd name="Secure PDF Vault" description="Store and manage PDFs in an encrypted browser-based document vault" steps={[{name:"Set a master password",text:"Create a strong master password for your vault"},{name:"Upload PDFs",text:"Drag and drop PDFs into your encrypted vault"},{name:"Access anytime",text:"Open view and download your PDFs securely with password protection"}]} />'
    ai = '<AiSummaryJsonLd name="PDF Vault" summary="Store sensitive PDF documents in an encrypted browser-based vault with password protection" category="SecurityApplications" inputType="PDF" outputType="Storage" processing="client-side" price="premium" features={["Encrypted storage","Password protection","localStorage persistence","Browser-based vault","No server storage"]} limits="Premium subscribers" />'
  }
  @{
    dir = "qr-stamp"
    howto = '<HowToJsonLd name="Add QR Code to PDF" description="Add QR codes to every page of a PDF document" steps={[{name:"Upload PDF",text:"Upload the PDF document to stamp with QR codes"},{name:"Enter URL or text",text:"Type the URL or text to encode in the QR code"},{name:"Download stamped PDF",text:"Download the PDF with QR codes added to each page"}]} />'
    ai = '<AiSummaryJsonLd name="QR Code Stamp" summary="Add QR codes to every page of PDF documents with customizable position and size" category="Graphics" inputType="PDF+Text" outputType="PDF" processing="client-side" price="premium" features={["QR code generation","Position customization","Size adjustment","Canvas-based rendering","No external APIs"]} limits="Premium subscribers" />'
  }
  @{
    dir = "metadata-sanitizer"
    howto = '<HowToJsonLd name="Clean PDF Metadata" description="Strip all hidden metadata from PDF documents including author and software info" steps={[{name:"Upload PDF",text:"Upload the PDF document to sanitize"},{name:"Select metadata to remove",text:"Choose which metadata fields to strip"},{name:"Download cleaned PDF",text:"Download the PDF with all selected metadata removed"}]} />'
    ai = '<AiSummaryJsonLd name="Metadata Sanitizer" summary="Remove hidden metadata from PDFs including author creation date software info annotations and embedded files" category="SecurityApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Author removal","Date stripping","Software info removal","Annotation cleaning","Embedded file removal"]} limits="Premium subscribers" />'
  }
  @{
    dir = "split-by-bookmarks"
    howto = '<HowToJsonLd name="Split PDF by Bookmarks" description="Split PDF documents into separate files based on bookmark structure" steps={[{name:"Upload PDF with bookmarks",text:"Upload a PDF that contains bookmarks or an outline structure"},{name:"Review detected bookmarks",text:"The tool shows all found bookmarks with their page numbers"},{name:"Download chapter files",text:"Each bookmark becomes a separate PDF file named after the bookmark title"}]} />'
    ai = '<AiSummaryJsonLd name="Split by Bookmarks" summary="Split PDF files into separate documents by extracting chapters and sections from the bookmark outline" category="Utilities" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Bookmark-based splitting","Chapter extraction","Outline parsing","Auto-naming","Client-side processing"]} limits="Premium subscribers" />'
  }
  @{
    dir = "bates-numbering"
    howto = '<HowToJsonLd name="Bates Numbering for PDF" description="Add sequential page numbers and custom labels to every page of a PDF" steps={[{name:"Upload PDF",text:"Upload the PDF document to number"},{name:"Configure numbering",text:"Set prefix suffix start number digit padding and position"},{name:"Download numbered PDF",text:"Download the PDF with Bates numbers applied to every page"}]} />'
    ai = '<AiSummaryJsonLd name="Bates Numbering" summary="Add sequential page numbers letters or custom labels to every page of PDF documents for legal and professional indexing" category="BusinessApplications" inputType="PDF" outputType="PDF" processing="client-side" price="premium" features={["Sequential numbering","Custom prefix suffix","Digit padding","Position selection","Legal document support"]} limits="Premium subscribers" />'
  }
)

$total = $tools.Count
$success = 0
$failed = 0

foreach ($tool in $tools) {
  $filePath = Join-Path $baseDir ($tool.dir + "\page.tsx")
  if (Test-Path $filePath) {
    $schemaBlock = $tool.howto + "`n      " + $tool.ai
    try {
      & $schemaScript -FilePath $filePath -ImportBlock $importBlock -SchemaBlock $schemaBlock
      $success++
    } catch {
      Write-Host "FAILED: $($tool.dir) - $_"
      $failed++
    }
  } else {
    Write-Host "NOT FOUND: $filePath"
    $failed++
  }
}

Write-Host "`nDone. $success updated, $failed failed (out of $total total)"
