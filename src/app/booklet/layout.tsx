import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booklet Creator — Make Printable PDF Booklets Free",
  description: "Turn any PDF into a print-ready booklet with correct page imposition. N-up layouts for saddle-stitch printing, right in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
