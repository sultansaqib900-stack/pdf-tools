interface Props {
  name: string;
  summary: string;
  category: string;
  inputType: string;
  outputType: string;
  processing: string;
  price: "free" | "premium";
  features: string[];
  limits?: string;
}

export default function AiSummaryJsonLd({ name, summary, category, inputType, outputType, processing, price, features, limits }: Props) {
  const json = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: category,
    description: summary,
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: price === "free" ? "0" : "12",
      priceCurrency: "USD",
    },
    featureList: features.join(", "),
    ...(limits ? { audience: { "@type": "Audience", audienceType: limits } } : {}),
    processingType: processing,
    inputType,
    outputType,
    abstract: summary,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
