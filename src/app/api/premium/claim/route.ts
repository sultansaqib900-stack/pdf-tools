import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@vercel/kv";
import { keys, setPremiumStatus } from "@/lib/kv";
import { validateEmail } from "@/lib/validation";

const kv = createClient({
  url: process.env.pdf_tools_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.pdf_tools_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const { email, clientId } = await req.json();
    if (!email || !clientId) {
      return NextResponse.json({ ok: false, error: "email and clientId required" }, { status: 400 });
    }

    const validEmail = validateEmail(email);
    if (!validEmail) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    try {
      const existing = await kv.get(keys.premiumByEmail(validEmail));
      if (existing === true) {
        await setPremiumStatus(clientId, true);
        return NextResponse.json({ ok: true, premium: true });
      }
    } catch {
      // KV unavailable
    }

    return NextResponse.json({ ok: false, premium: false, error: "No premium found for this email" });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to claim premium" }, { status: 500 });
  }
}
