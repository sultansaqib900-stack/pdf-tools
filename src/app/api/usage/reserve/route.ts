import { NextRequest, NextResponse } from "next/server";
import { recordTrialProcessingStat, reserveTrialUse, TRIAL_FILE_LIMIT } from "@/lib/usageStore";
import { resolveUsageIdentity, sanitizeClientId, sanitizeReservationId } from "@/lib/usageIdentity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Atomically reserve one file of the shared lifetime trial before processing
 * begins on a Premium/professional tool. Basic tools never call this route.
 *
 * The reservation is a single Redis (Lua) operation, so several tabs reserving
 * the same last trial file cannot both succeed. Premium accounts bypass the
 * allowance without consuming it.
 */
export async function POST(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 100, window: 60, identifier: "usage-reserve" });
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
    if (!identity) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    if (identity.premium) {
      return NextResponse.json({
        ok: true,
        premium: true,
        remaining: null,
        limit: TRIAL_FILE_LIMIT,
      });
    }

    const result = await reserveTrialUse(identity.identity, reservationId);
    if (result.ok) {
      await recordTrialProcessingStat();
    }
    return NextResponse.json({ ...result, premium: false, limit: TRIAL_FILE_LIMIT });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
