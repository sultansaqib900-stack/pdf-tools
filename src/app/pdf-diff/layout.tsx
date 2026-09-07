import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Two PDFs — Free PDF Diff Tool Online",
  description: "Spot every change between two PDF versions side by side. Highlights added and removed text instantly, with no uploads required.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
