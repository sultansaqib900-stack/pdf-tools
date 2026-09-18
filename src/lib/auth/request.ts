import { getSession } from "@/lib/auth/sessions";

export async function getAuthenticatedSession(
  request: Request,
): Promise<{ userId: string; email: string } | null> {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const cookieToken = request.headers.get("cookie")?.match(/(?:^|;\s*)pdftools_session=([^;]+)/)?.[1] || "";
  const token = bearer || cookieToken;
  return token ? getSession(token) : null;
}
