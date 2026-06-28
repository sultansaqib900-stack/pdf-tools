import { NextRequest, NextResponse } from "next/server";
import { getDailyUsage } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const { success, reset } = await rateLimit(req, { limit: 100, window: 60 });
  if (!success) {
    return rateLimitResponse(reset);
  }

  try {
    const clientId = req.nextUrl.searchParams.get("clientId");
    if (!validateString(clientId, 100)) {
      return NextResponse.json({ ok: false, error: "Invalid clientId" }, { status: 400 });
    }

    const usage = await getDailyUsage(clientId!);
    return NextResponse.json({ ok: true, ...usage });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
