export default function HreflangTags() {
  const base = "https://allaboutpdfediting.xyz";
  return (
    <>
      <link rel="alternate" href={base} hrefLang="en" />
      <link rel="alternate" href={base} hrefLang="en-US" />
      <link rel="alternate" href={base} hrefLang="en-CA" />
      <link rel="alternate" href={base} hrefLang="en-GB" />
      <link rel="alternate" href={base} hrefLang="en-AU" />
      <link rel="alternate" href={base} hrefLang="en-NZ" />
      <link rel="alternate" href={base} hrefLang="en-IE" />
      <link rel="alternate" href={`${base}/es`} hrefLang="es" />
      <link rel="alternate" href={`${base}/es`} hrefLang="es-ES" />
      <link rel="alternate" href={base} hrefLang="x-default" />
    </>
  );
}
