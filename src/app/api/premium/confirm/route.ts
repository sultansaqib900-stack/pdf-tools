import { NextResponse } from "next/server";

// This endpoint is hit when the user is redirected back from Lemon Squeezy.
// After a successful purchase, the premium page calls this to activate premium server-side.
import { setPremiumStatus } from "@/lib/kv";

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "No clientId" }, { status: 400 });
    }

    await setPremiumStatus(clientId, true);
    return NextResponse.json({ ok: true, premium: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
