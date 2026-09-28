import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  path: "/pdf-inverter",
  title: "PDF Color Inverter - Dark Mode & Accessibility Converter",
  description: "Convert PDF colors: invert to dark mode, convert to grayscale, or increase contrast for accessibility. Free.",
});

export default function Layout({ children }: { children: React.ReactNode }) { return children; }
