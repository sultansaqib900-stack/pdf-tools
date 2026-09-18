import { NextRequest, NextResponse } from "next/server";
import { releaseTrialUse, TRIAL_FILE_LIMIT } from "@/lib/usageStore";
import { resolveUsageIdentity, sanitizeClientId, sanitizeReservationId } from "@/lib/usageIdentity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Refund a reservation after a processing failure. Each reservation token can
 * be redeemed exactly once (single-use atomic token), so a client cannot
 * repeatedly release to manufacture extra trial allowance.
 */
export async function POST(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 100, window: 60, identifier: "usage-release" });
  if (!success) {
    return rateLimitResponse(reset);
  }

  try {
    const body = await req.json();
    const clientId = sanitizeClientId(body.clientId);
    const reservationId = sanitizeReservationId(body.reservationId);
    if (!clientId || !reservationId) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    const identity = await resolveUsageIdentity(req, clientId);
    if (!identity || identity.premium) {
      // Premium users never consumed quota in the first place.
      return NextResponse.json({ ok: true, premium: identity?.premium === true, remaining: null, limit: TRIAL_FILE_LIMIT });
    }

    const result = await releaseTrialUse(identity.identity, reservationId);
    return NextResponse.json({ ...result, premium: false, limit: TRIAL_FILE_LIMIT });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
