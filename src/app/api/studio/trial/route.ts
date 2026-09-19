import { NextRequest, NextResponse } from "next/server";
import { getStudioTrial } from "@/lib/studioTrialStore";
import { resolveUsageIdentity, sanitizeClientId } from "@/lib/usageIdentity";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const headers = { "Cache-Control": "private, no-store" };

async function handle(req: NextRequest, start: boolean) {
  if (start && req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  }
  const { success, reset } = await rateLimit(req, {
    limit: start ? 10 : 120, window: 60, identifier: start ? "studio-start" : "studio-status",
  });
  if (!success) return rateLimitResponse(reset);

  let clientId: string | null;
  try {
    clientId = sanitizeClientId(start ? (await req.json())?.clientId : req.nextUrl.searchParams.get("clientId"));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers });
  }
  if (!clientId) return NextResponse.json({ error: "Invalid clientId" }, { status: 400, headers });

  try {
    const identity = await resolveUsageIdentity(req, clientId);
    if (!identity) return NextResponse.json({ error: "Invalid identity" }, { status: 400, headers });
    // Paid members do not start or consume a trial. No Premium grants are written.
    const trial = identity.premium
      ? { status: "premium", expiresAt: null, remainingMs: 0 }
      : await getStudioTrial(identity.identity, clientId, start);
    return NextResponse.json({ ok: true, ...trial }, { headers });
  } catch {
    // Never substitute a local timestamp or restart a trial on a KV outage.
    return NextResponse.json({ error: "Could not verify PDF Studio access. Please try again." }, { status: 503, headers });
  }
}

export const GET = (req: NextRequest) => handle(req, false);
export const POST = (req: NextRequest) => handle(req, true);
