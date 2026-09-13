import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/sessions";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  if (token) await deleteSession(token).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
