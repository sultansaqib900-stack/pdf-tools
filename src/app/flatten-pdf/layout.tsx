import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flatten PDF Free — Merge Layers & Form Fields",
  description: "Flatten PDF files online for free. Merge form fields, annotations, and layers into the page content. No uploads, 100% private, all in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
