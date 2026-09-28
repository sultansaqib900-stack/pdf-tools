import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/es/compress",
  title: "Comprimir PDF Online Gratis — Reducir Tamaño de PDF",
  description: "Comprime archivos PDF online gratis. Reduce el tamaño de tu PDF sin perder calidad. 100% gratis, sin subir archivos — todo el procesamiento ocurre en tu navegador.",
  locale: "es",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
