import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import EsToolNav from "@/components/EsToolNav";

export const metadata: Metadata = buildMetadata({
  path: "/es/image-to-pdf",
  title: "Imagen a PDF Online Gratis — JPG y PNG a PDF",
  description: "Convierte imágenes JPG, PNG y WebP a PDF online gratis. Crea documentos PDF desde fotos sin subir archivos a ningún servidor — todo en tu navegador.",
  locale: "es",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <EsToolNav current="/es/image-to-pdf" />
    </>
  );
}
