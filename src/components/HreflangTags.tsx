"use client";

import { usePathname } from "next/navigation";
import { hasSpanishVersion, normalizePath } from "@/lib/i18n";

export default function HreflangTags() {
  const pathname = usePathname();
  const cleanPath = normalizePath(pathname);
  const base = "https://allaboutpdfediting.xyz";
  const enUrl = `${base}${cleanPath}`;
  const esUrl = cleanPath === "/" ? `${base}/es` : `${base}/es${cleanPath}`;
  const hasEs = hasSpanishVersion(cleanPath);

  return (
    <>
      <link rel="alternate" href={enUrl} hrefLang="en" />
      <link rel="alternate" href={enUrl} hrefLang="en-US" />
      <link rel="alternate" href={enUrl} hrefLang="en-CA" />
      <link rel="alternate" href={enUrl} hrefLang="en-GB" />
      <link rel="alternate" href={enUrl} hrefLang="en-AU" />
      <link rel="alternate" href={enUrl} hrefLang="en-NZ" />
      <link rel="alternate" href={enUrl} hrefLang="en-IE" />
      {hasEs && <link rel="alternate" href={esUrl} hrefLang="es" />}
      {hasEs && <link rel="alternate" href={esUrl} hrefLang="es-ES" />}
      <link rel="alternate" href={enUrl} hrefLang="x-default" />
    </>
  );
}
