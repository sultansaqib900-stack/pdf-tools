import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/request";
import { bindPremiumClientForUser, getPremiumStatusByUserId } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 10, window: 60, identifier: "premium-claim" });
  if (!success) return rateLimitResponse(reset);

  try {
    const session = await getAuthenticatedSession(req);
    if (!session) {
      return NextResponse.json({ ok: false, premium: false, error: "Sign in to the account used to start checkout." }, { status: 401 });
    }

    const { clientId: rawClientId } = await req.json();
    const clientId = validateString(rawClientId, 100);
    if (!clientId) {
      return NextResponse.json({ ok: false, premium: false, error: "Invalid clientId" }, { status: 400 });
    }

    if (!(await getPremiumStatusByUserId(session.userId))) {
      return NextResponse.json({ ok: false, premium: false, error: "No active signed-in checkout is linked to this account." }, { status: 404 });
    }

    const bound = await bindPremiumClientForUser(session.userId, clientId);
    return NextResponse.json({ ok: bound, premium: bound });
  } catch {
    return NextResponse.json({ ok: false, premium: false, error: "Failed to activate Premium." }, { status: 500 });
  }
}
