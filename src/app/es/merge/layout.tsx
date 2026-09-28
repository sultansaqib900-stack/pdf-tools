import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import EsToolNav from "@/components/EsToolNav";

export const metadata: Metadata = buildMetadata({
  path: "/es/merge",
  title: "Unir PDF Online Gratis — Combinar Varios PDF en Uno",
  description: "Une varios archivos PDF en un solo documento online gratis. Combina PDFs en segundos sin subir archivos a ningún servidor — todo en tu navegador.",
  locale: "es",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <EsToolNav current="/es/merge" />
    </>
  );
}
