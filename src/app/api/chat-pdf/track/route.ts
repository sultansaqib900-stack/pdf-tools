import { NextRequest, NextResponse } from "next/server";
import { trackChatUsage } from "@/lib/kv";

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();
    if (!clientId) return NextResponse.json({ ok: false, remaining: 0 });

    const result = await trackChatUsage(clientId);
    return NextResponse.json({ ok: result.ok, remaining: result.remaining });
  } catch {
    return NextResponse.json({ ok: true, remaining: 3 });
  }
}
