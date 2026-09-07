import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF by Bookmarks — Extract Chapters Free",
  description: "Split a PDF into separate files using its bookmark outline. Ideal for extracting chapters from ebooks and reports. Browser-based.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
