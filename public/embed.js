(function() {
  var BASE = "https://allaboutpdfediting.xyz";

  if (customElements.get("pdf-tool")) return;

  var TOOLS = [
    "compress", "merge", "split", "image-to-pdf", "edit-pdf",
    "unlock", "protect", "rotate", "delete-pages", "organize",
    "sign", "ocr-pdf", "extract-text", "pdf-to-word", "word-to-pdf",
    "repair-pdf", "watermark", "add-page-numbers", "annotate", "fill-form",
    "flatten-pdf", "reverse-pdf", "resize", "crop", "html-to-pdf",
    "text-to-pdf", "scan-to-pdf", "batch", "chat-pdf", "metadata"
  ];

  var STYLES = [
    ":host { display: block; width: 100%; }",
    "iframe { width: 100%; height: 100%; border: none; border-radius: 12px; }",
    ".pdf-tool-error { padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #666; }",
    ".pdf-tool-error a { color: #4f46e5; text-decoration: underline; }"
  ].join(" ");

  var HEIGHTS = {
    "compress": 540, "merge": 480, "split": 540, "image-to-pdf": 540,
    "edit-pdf": 600, "sign": 600, "fill-form": 540, "chat-pdf": 560,
    "ocr-pdf": 540, "unlock": 400, "protect": 500, "rotate": 400,
    "delete-pages": 540, "organize": 540, "batch": 500,
    "extract-text": 480, "pdf-to-word": 540, "word-to-pdf": 400,
    "repair-pdf": 480, "watermark": 540, "add-page-numbers": 540,
    "annotate": 600, "flatten-pdf": 400, "reverse-pdf": 400,
    "resize": 480, "crop": 540, "html-to-pdf": 500,
    "text-to-pdf": 480, "scan-to-pdf": 480, "metadata": 480
  };

  var LABELS = {
    "compress": "compress", "merge": "merge", "split": "split",
    "image-to-pdf": "convert image to PDF", "edit-pdf": "edit PDF",
    "unlock": "unlock PDF", "protect": "protect PDF", "rotate": "rotate PDF",
    "delete-pages": "delete PDF pages", "organize": "organize PDF pages",
    "sign": "sign PDF", "ocr-pdf": "OCR PDF", "extract-text": "extract text from PDF",
    "pdf-to-word": "convert PDF to Word", "word-to-pdf": "convert Word to PDF",
    "repair-pdf": "repair PDF", "watermark": "add watermark to PDF",
    "add-page-numbers": "add page numbers to PDF", "annotate": "annotate PDF",
    "fill-form": "fill PDF form", "flatten-pdf": "flatten PDF",
    "reverse-pdf": "reverse PDF pages", "resize": "resize PDF",
    "crop": "crop PDF", "html-to-pdf": "convert HTML to PDF",
    "text-to-pdf": "convert text to PDF", "scan-to-pdf": "scan to PDF",
    "batch": "batch process PDF", "chat-pdf": "chat with PDF",
    "metadata": "edit PDF metadata"
  };

  class PDFTool extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      var style = document.createElement("style");
      style.textContent = STYLES;
      this.shadowRoot.appendChild(style);
    }

    connectedCallback() {
      var tool = this.getAttribute("tool") || "compress";
      var theme = this.getAttribute("theme") || "light";
      var height = this.getAttribute("height") || "";
      var origin = encodeURIComponent(window.location.origin);

      if (TOOLS.indexOf(tool) === -1) {
        var err = document.createElement("div");
        err.className = "pdf-tool-error";
        err.innerHTML = 'Unknown tool: "' + tool + '". <a href="' + BASE + '/embed" target="_blank">See available tools</a>.';
        this.shadowRoot.appendChild(err);
        return;
      }

      var h = height || (HEIGHTS[tool] || 500) + "px";
      this.style.height = h;

      var iframe = document.createElement("iframe");
      iframe.src = BASE + "/" + tool + "?embed=1&origin=" + origin;
      iframe.setAttribute("title", "Free " + (LABELS[tool] || tool) + " PDF tool");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("allow", "clipboard-read; clipboard-write");
      iframe.style.height = h;
      this.shadowRoot.appendChild(iframe);

      window.addEventListener("message", function(e) {
        if (e.origin !== BASE) return;
        if (e.data && e.data.type === "pdf-tool-resize") {
          var h = parseInt(e.data.height, 10);
          if (h > 100) {
            iframe.style.height = h + "px";
          }
        }
      });
    }
  }

  customElements.define("pdf-tool", PDFTool);
})();
