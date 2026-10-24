import { PREMIUM_TOOLS, PREMIUM_TOOL_COUNT } from "@/lib/toolCatalog";
import { PRICING_CONFIG } from "@/lib/pricing";

export default function ProductJsonLd() {
  const premiumNames = PREMIUM_TOOLS.map((tool) => tool.title).join(", ");
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PDFTools Premium",
    description: `Premium PDF subscription with unlimited basic and professional tools (no lifetime trial limit), 100MB file support, batch workflows, unlimited AI questions, and ${PREMIUM_TOOL_COUNT} professional tools: ${premiumNames}.`,
    url: "https://allaboutpdfediting.xyz/premium",
    image: "https://allaboutpdfediting.xyz/opengraph-image",
    brand: { "@type": "Brand", name: "PDFTools" },
    offers: [
      {
        "@type": "Offer",
        name: "Premium Monthly",
        price: String(PRICING_CONFIG.monthly.amount),
        priceCurrency: PRICING_CONFIG.currencyCode,
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://allaboutpdfediting.xyz/premium",
      },
      {
        "@type": "Offer",
        name: "Premium Yearly",
        price: String(PRICING_CONFIG.yearly.amount),
        priceCurrency: PRICING_CONFIG.currencyCode,
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
        url: "https://allaboutpdfediting.xyz/premium",
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
