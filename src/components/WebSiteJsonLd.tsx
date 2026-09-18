export default function WebSiteJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PDFTools",
    url: "https://allaboutpdfediting.xyz",
    description: "Free online PDF tools to compress, merge, split, convert, and edit PDFs instantly in your browser.",
    inLanguage: "en",
    audience: {
      "@type": "Audience",
      audienceType: ["US", "CA", "GB", "AU", "NZ", "IE"],
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}