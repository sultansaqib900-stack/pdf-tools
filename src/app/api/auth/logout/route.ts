import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/sessions";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const cookieToken = request.headers.get("cookie")?.match(/(?:^|;\s*)pdftools_session=([^;]+)/)?.[1] || "";
  await Promise.all([token, cookieToken].filter(Boolean).map((t) => deleteSession(t).catch(() => undefined)));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("pdftools_session", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
