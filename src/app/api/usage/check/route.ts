import { NextRequest, NextResponse } from "next/server";
import { getTrialUsage } from "@/lib/usageStore";
import { resolveUsageIdentity, sanitizeClientId } from "@/lib/usageIdentity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { TRIAL_FILE_LIMIT } from "@/lib/usageStore";

/**
 * Peek at the shared lifetime professional-tools trial. Never consumes quota.
 * Basic tools are unlimited and never consult this endpoint.
 */
export async function GET(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 100, window: 60, identifier: "usage-check" });
  if (!success) {
    return rateLimitResponse(reset);
  }

  try {
    const clientId = sanitizeClientId(req.nextUrl.searchParams.get("clientId"));
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "Invalid clientId" }, { status: 400 });
    }

    const identity = await resolveUsageIdentity(req, clientId);
    if (!identity) {
      return NextResponse.json({ ok: false, error: "Invalid clientId" }, { status: 400 });
    }

    if (identity.premium) {
      return NextResponse.json({
        ok: true,
        premium: true,
        limit: TRIAL_FILE_LIMIT,
        used: 0,
        remaining: null,
      });
    }

    const usage = await getTrialUsage(identity.identity);
    return NextResponse.json({ ok: true, premium: false, limit: TRIAL_FILE_LIMIT, ...usage });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
