export default function HreflangTags() {
  const url = "https://allaboutpdfediting.xyz";
  return (
    <>
      <link rel="alternate" href={url} hrefLang="en" />
      <link rel="alternate" href={url} hrefLang="en-US" />
      <link rel="alternate" href={url} hrefLang="en-CA" />
      <link rel="alternate" href={url} hrefLang="en-GB" />
      <link rel="alternate" href={url} hrefLang="en-AU" />
      <link rel="alternate" href={url} hrefLang="en-NZ" />
      <link rel="alternate" href={url} hrefLang="en-IE" />
      <link rel="alternate" href={url} hrefLang="x-default" />
    </>
  );
}
