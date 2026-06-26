export default function ProductJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PDFTools Premium",
    description:
      "Premium PDF tool subscription with unlimited file processing, 100MB file support, batch processing, ad-free experience, and 13 exclusive premium tools including PDF comparison, certificate generation, PDF-to-audio, form data extraction, bulk rename, booklet creator, search & redact, color inverter, secure vault, QR code stamp, metadata sanitizer, split by bookmarks, and bates numbering.",
    url: "https://allaboutpdfediting.xyz/premium",
    image: "https://allaboutpdfediting.xyz/opengraph-image.png",
    brand: { "@type": "Brand", name: "PDFTools" },
    offers: [
      {
        "@type": "Offer",
        name: "Premium Monthly",
        price: "12",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://allaboutpdfediting.xyz/premium",
      },
      {
        "@type": "Offer",
        name: "Premium Yearly",
        price: "100",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://allaboutpdfediting.xyz/premium",
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
