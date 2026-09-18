import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFTools - 52 Herramientas PDF | 39 Gratuitas y 13 Profesionales",
  description:
    "52 herramientas PDF: 39 herramientas principales con acceso gratuito y 13 herramientas profesionales Premium para IA, automatización, redacción segura, trabajo legal y procesamiento por lotes. La mayoría del procesamiento se realiza localmente en tu navegador.",
  keywords: ["herramientas PDF", "comprimir PDF", "unir PDF", "dividir PDF", "editor PDF gratis", "convertir PDF"],
  openGraph: {
    title: "PDFTools - 52 Herramientas PDF",
    description: "39 herramientas con acceso gratuito y 13 herramientas profesionales Premium. La mayoría del procesamiento permanece en tu navegador.",
    url: "https://allaboutpdfediting.xyz/es",
    siteName: "PDFTools",
    type: "website",
    locale: "es_ES",
    images: [{ url: "https://allaboutpdfediting.xyz/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFTools - 52 Herramientas PDF",
    description: "39 herramientas con acceso gratuito y 13 herramientas profesionales Premium.",
    images: ["https://allaboutpdfediting.xyz/opengraph-image"],
  },
};

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
