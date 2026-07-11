=== PDF Tools Embed ===
Contributors: pdftools
Tags: pdf, pdf tools, compress pdf, merge pdf, split pdf, edit pdf, pdf embed, free pdf, pdf converter
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
Requires PHP: 7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed 30+ free PDF tools on your WordPress site. Compress, merge, split, edit, sign, OCR, and more. Zero setup, all client-side.

== Description ==

Add fully functional PDF tools to your WordPress site with a simple shortcode or Gutenberg block. No API keys, no server setup, no monthly fees. All processing happens in the user's browser using WebAssembly — files never leave their device.

= Features =

* **30+ free PDF tools** — Compress, merge, split, edit, sign, unlock, protect, OCR, convert, and more
* **Shortcode support** — Simply add `[pdf_tool tool="compress"]` to any page or post
* **Gutenberg block** — Search for "PDF Tool" in the block editor and configure via dropdown
* **Widget** — Add a PDF tool to any sidebar
* **100% private** — All processing happens client-side, zero server uploads
* **Zero maintenance** — Tools auto-update from our CDN, your embeds stay current
* **Dark mode support** — Add `theme="dark"` attribute for dark-themed sites

= Available Tools =

* Compress PDF, Merge PDF, Split PDF, Image to PDF, Edit PDF
* Unlock PDF, Protect PDF, Rotate PDF, Delete Pages, Organize Pages
* Sign PDF, Fill Form, OCR PDF, Extract Text, PDF to Word
* Word to PDF, Repair PDF, Add Watermark, Add Page Numbers
* Annotate PDF, Flatten PDF, Reverse Pages, Resize PDF, Crop PDF
* HTML to PDF, Text to PDF, Scan to PDF, Batch Process, Chat with PDF
* Edit PDF Metadata

== Installation ==

1. Upload the `pdf-tools-embed` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Use the `[pdf_tool tool="compress"]` shortcode in any post or page
4. Or search for the "PDF Tool Embed" block in the Gutenberg editor

== Frequently Asked Questions ==

= Do I need an API key? =

No. Everything works out of the box. No signup, no API keys, no accounts needed.

= Where are files processed? =

Entirely in the visitor's browser using WebAssembly. Files never leave their device. No data is uploaded to any server.

= Can I use this on a WooCommerce product page? =

Yes. Add the shortcode to any product description or use the Gutenberg block in the product editor.

= Does it work with caching plugins? =

Yes. The embed script is loaded from our CDN and is compatible with W3 Total Cache, WP Rocket, WP Super Cache, and all major caching plugins.

= Which themes are supported? =

All themes. The embed uses a shadow DOM, so your theme's CSS won't affect the tool's appearance. Use `theme="dark"` for dark-themed sites.

== Usage ==

Basic shortcode:
`[pdf_tool tool="compress"]`

With dark theme:
`[pdf_tool tool="merge" theme="dark"]`

With custom height:
`[pdf_tool tool="edit-pdf" height="600px"]`

== Changelog ==

= 1.0.0 =
* Initial release with 30+ PDF tools
* Shortcode, Gutenberg block, and widget support
* Light and dark themes
