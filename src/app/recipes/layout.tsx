import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Recipes & Macros - 1-Click Multi-Step Workflows | PDFTools",
  description: "Chain multi-step PDF operations together into 1-click recipes. Legal e-filing, board prep, peer-review macros with 100% client-side privacy.",
  openGraph: {
    title: "PDF Recipes & Macro Automations",
    description: "The Zapier for PDFs. Execute chained workflows in 1 click.",
  },
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
