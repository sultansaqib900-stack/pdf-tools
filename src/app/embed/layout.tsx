import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed PDF Tools on Your Website — Free Widgets",
  description: "Add free PDF tools to your own site with a single iframe. Compress, merge and convert widgets that run in your visitors' browsers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
