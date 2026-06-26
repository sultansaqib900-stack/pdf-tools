export default function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PDFTools",
    url: "https://allaboutpdfediting.xyz",
    logo: "https://allaboutpdfediting.xyz/opengraph-image.png",
    description: "Free online PDF tools to compress, merge, split, convert, and edit PDFs instantly in your browser. No uploads. 100% private.",
    sameAs: [],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}