import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract PDF Form Data to CSV — Free Online Tool",
  description: "Pull filled form field values out of PDFs and export them to CSV or Excel. Batch process many forms at once in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
