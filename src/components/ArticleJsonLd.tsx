interface Props {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export default function ArticleJsonLd({ title, description, url, image, datePublished, dateModified, authorName }: Props) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: image || "https://allaboutpdfediting.xyz/opengraph-image.png",
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: authorName || "Saqib" },
    publisher: {
      "@type": "Organization",
      name: "PDFTools",
      url: "https://allaboutpdfediting.xyz",
      logo: { "@type": "ImageObject", url: "https://allaboutpdfediting.xyz/opengraph-image.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
