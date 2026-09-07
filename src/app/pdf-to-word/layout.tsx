import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word Free — Convert PDF to DOCX Online",
  description: "Convert PDF to editable Word documents free. Keeps text and layout intact, runs entirely in your browser with no file uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
