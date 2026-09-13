import { getSession } from "@/lib/auth/sessions";

export async function getAuthenticatedSession(
  request: Request,
): Promise<{ userId: string; email: string } | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  return getSession(token);
}
