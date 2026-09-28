import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import EsToolNav from "@/components/EsToolNav";

export const metadata: Metadata = buildMetadata({
  path: "/es/split",
  title: "Dividir PDF Online Gratis — Separar Páginas de PDF",
  description: "Divide archivos PDF en varios documentos online gratis. Extrae páginas o separa rangos sin subir archivos — todo el procesamiento ocurre en tu navegador.",
  locale: "es",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <EsToolNav current="/es/split" />
    </>
  );
}
