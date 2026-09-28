import { makeOgImage, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return makeOgImage("How to Compress a PDF", "Step-by-step guide with real compression results");
}
