interface Props {
  name: string;
  description: string;
  url: string;
  image?: string;
  aggregateRating?: { ratingValue: number; bestRating: number; ratingCount: number };
}

export default function SoftwareAppJsonLd({ name, description, url, image, aggregateRating }: Props) {
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    image: image || "https://allaboutpdfediting.xyz/opengraph-image.png",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "PDFTools", url: "https://allaboutpdfediting.xyz" },
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ...aggregateRating,
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
