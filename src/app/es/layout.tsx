import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFTools - Herramientas PDF Gratuitas | Comprimir, Unir, Dividir y Más",
  description:
    "Más de 40 herramientas PDF gratuitas incluyendo funciones premium: comprimir, unir, dividir, convertir imágenes, extraer texto, comparar PDFs, generar certificados, convertir PDF a audio, crear folletos y más. 100% gratis, sin subidas, todo el procesamiento ocurre en tu navegador.",
  keywords: ["herramientas PDF", "comprimir PDF", "unir PDF", "dividir PDF", "editor PDF gratis", "convertir PDF"],
  openGraph: {
    title: "PDFTools - Herramientas PDF Gratuitas",
    description: "Más de 40 herramientas PDF gratuitas. Comprime, une, divide, compara, convierte a audio, genera certificados y más. Sin subidas. 100% gratis.",
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
