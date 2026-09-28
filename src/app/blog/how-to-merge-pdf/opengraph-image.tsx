import { makeOgImage, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return makeOgImage("How to Merge PDFs", "Combine multiple PDFs into one document — free guide");
}
