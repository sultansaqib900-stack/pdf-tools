import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Your Files Never Leave Your Device",
  description: "How PDFTools handles your data. Files are processed locally in your browser and never uploaded. Details on cookies, analytics and ads.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
