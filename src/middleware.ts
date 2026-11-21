import { NextResponse, type NextRequest } from "next/server";

/**
 * Spanish locale signal.
 *
 * The app router allows only one `<html>` element (in the root layout, which
 * must stay `lang="en"` for the English site). `src/app/es/layout.tsx` sets
 * `lang="es"` on the Spanish subtree and corrects `documentElement.lang` on the
 * client, and this middleware adds the matching HTTP `Content-Language` header
 * so crawlers and screen readers get the locale from the response itself —
 * without rewriting, renaming, or redirecting any URL.
 *
 * Scoped to `/es` only, so it never runs for English pages or static assets.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Language", "es");
  // Keep the alternate-link relationship explicit at the response level too.
  response.headers.append(
    "Link",
    '<https://allaboutpdfediting.xyz/>; rel="alternate"; hreflang="x-default"',
  );
  void request;
  return response;
}

export const config = {
  matcher: ["/es", "/es/(.*)"],
};
