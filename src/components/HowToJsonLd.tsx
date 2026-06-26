interface Step {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface Props {
  name: string;
  description: string;
  steps: Step[];
  totalTime?: string;
  image?: string;
}

export default function HowToJsonLd({ name, description, steps, totalTime = "PT1M", image }: Props) {
  const json = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(image ? { image } : {}),
    totalTime,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
      ...(s.image ? { image: s.image } : {}),
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
