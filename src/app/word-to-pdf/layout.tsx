import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF Free — Convert DOCX to PDF Online",
  description: "Convert Word documents to PDF free online. Preserves formatting and fonts, processed locally in your browser with no uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
