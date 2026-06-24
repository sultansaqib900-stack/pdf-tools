import { NextRequest, NextResponse } from "next/server";
import { incrementDailyUsage } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ ok: false, error: "No clientId" }, { status: 400 });
  }

  const usage = await incrementDailyUsage(clientId);
  return NextResponse.json({ ok: true, ...usage });
}
