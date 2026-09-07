import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Annotate PDF Free — Highlight, Comment & Markup",
  description: "Annotate PDF documents online for free. Highlight text, add comments, draw shapes, and markup PDFs instantly in your browser. No uploads required.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
