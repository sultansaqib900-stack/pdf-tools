import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invert PDF Colors — Dark Mode & Grayscale Online",
  description: "Invert PDF colours for comfortable night reading, convert to grayscale, or boost contrast. Free, instant and fully browser-based.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
