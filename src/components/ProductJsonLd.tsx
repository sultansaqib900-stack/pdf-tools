import { PREMIUM_TOOLS, PREMIUM_TOOL_COUNT } from "@/lib/toolCatalog";

export default function ProductJsonLd() {
  const premiumNames = PREMIUM_TOOLS.map((tool) => tool.title).join(", ");
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PDFTools Premium",
    description: `Premium PDF subscription with unlimited processing, 100MB file support, batch workflows, unlimited AI questions, and ${PREMIUM_TOOL_COUNT} professional tools: ${premiumNames}.`,
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
