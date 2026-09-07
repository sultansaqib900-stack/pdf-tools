import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Herramientas PDF Gratis — Comprimir, Unir y Dividir",
  description:
    "Más de 40 herramientas PDF gratuitas: comprime, une, divide y convierte. Todo ocurre en tu navegador, sin subidas y sin registro.",
  keywords: ["herramientas PDF", "comprimir PDF", "unir PDF", "dividir PDF", "editor PDF gratis", "convertir PDF"],
  openGraph: {
    title: "PDFTools - Herramientas PDF Gratuitas",
    description: "Más de 40 herramientas PDF gratuitas: comprime, une, divide y convierte. Todo en tu navegador, sin subidas y sin registro.",
    url: "https://allaboutpdfediting.xyz/es",
    siteName: "PDFTools",
    type: "website",
    locale: "es_ES",
    images: [{ url: "https://allaboutpdfediting.xyz/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFTools - Herramientas PDF Gratuitas",
    description: "Más de 40 herramientas PDF gratuitas. Comprime, une, divide y más. Sin subidas. 100% gratis.",
    images: ["https://allaboutpdfediting.xyz/opengraph-image.png"],
  },
};

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
