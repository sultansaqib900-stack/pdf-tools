export default function WebSiteJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PDFTools",
    url: "https://allaboutpdfediting.xyz",
    description: "Free online PDF tools to compress, merge, split, convert, and edit PDFs instantly in your browser.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://allaboutpdfediting.xyz/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}