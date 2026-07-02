import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales, type Locale } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value as Locale | undefined;
  if (localeCookie && locales.includes(localeCookie)) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", localeCookie, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
  const detected: Locale = preferred === "es" ? "es" : defaultLocale;

  if (detected !== defaultLocale) {
    const url = new URL(`/${detected}${pathname}`, request.url);
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", detected, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", defaultLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
