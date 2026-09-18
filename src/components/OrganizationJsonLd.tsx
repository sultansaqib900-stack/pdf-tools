export default function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PDFTools",
    url: "https://allaboutpdfediting.xyz",
    // Google requires a crawlable raster logo (>=112x112px, square, PNG) for
    // brand results. Keep this a direct PNG URL, not an SVG or the OG image.
    logo: {
      "@type": "ImageObject",
      url: "https://allaboutpdfediting.xyz/icons/icon-512.png",
      width: 512,
      height: 512,
    },
    image: [
      "https://allaboutpdfediting.xyz/icons/icon-512.png",
      "https://allaboutpdfediting.xyz/opengraph-image",
    ],
    description: "Free online PDF tools to compress, merge, split, convert, and edit PDFs instantly in your browser. No uploads. 100% private.",
    inLanguage: "en",
    areaServed: ["US", "CA", "GB", "AU", "NZ", "IE"],
    sameAs: [],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}