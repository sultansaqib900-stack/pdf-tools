import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Rename PDFs — Auto-Rename by Metadata Online",
  description: "Rename many PDFs at once using title, author or date metadata. Build custom filename patterns and download as a ZIP. No uploads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
