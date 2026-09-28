import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/es/edit-pdf",
  title: "Editar PDF Online Gratis — Añadir Texto e Imágenes",
  description: "Edita archivos PDF online gratis. Añade texto, imágenes y anotaciones sin subir tu documento — todo el procesamiento se hace en tu navegador.",
  locale: "es",
  hasEs: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
