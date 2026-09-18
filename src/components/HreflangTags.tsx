"use client";

import { usePathname } from "next/navigation";

const translatedSlugs = new Set([
  "", "compress", "merge", "split", "image-to-pdf", "edit-pdf",
]);

export default function HreflangTags() {
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");
  const cleanPath = isEs ? pathname.replace(/^\/es/, "") || "/" : pathname || "/";
  const base = "https://allaboutpdfediting.xyz";
  const enUrl = `${base}${cleanPath}`;
  const esUrl = `${base}/es${cleanPath}`;
  const slug = cleanPath.replace(/^\//, "");

  return (
    <>
      <link rel="alternate" href={enUrl} hrefLang="en" />
      <link rel="alternate" href={enUrl} hrefLang="en-US" />
      <link rel="alternate" href={enUrl} hrefLang="en-CA" />
      <link rel="alternate" href={enUrl} hrefLang="en-GB" />
      <link rel="alternate" href={enUrl} hrefLang="en-AU" />
      <link rel="alternate" href={enUrl} hrefLang="en-NZ" />
      <link rel="alternate" href={enUrl} hrefLang="en-IE" />
      {translatedSlugs.has(slug) && <link rel="alternate" href={esUrl} hrefLang="es" />}
      {translatedSlugs.has(slug) && <link rel="alternate" href={esUrl} hrefLang="es-ES" />}
      <link rel="alternate" href={enUrl} hrefLang="x-default" />
    </>
  );
}
