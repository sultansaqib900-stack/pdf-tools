import { makeOgImage, ogSize, ogContentType } from "@/lib/ogImage";

export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return makeOgImage("Image to PDF", "Turn JPG and PNG photos into PDF documents — private & free");
}
