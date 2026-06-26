import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@vercel/kv";

const kv = createClient({
  url: process.env.pdf_tools_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.pdf_tools_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const { clientId, plan } = await req.json();
    if (!clientId || !plan) {
      return NextResponse.json({ ok: false, error: "clientId and plan required" }, { status: 400 });
    }
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ ok: false, error: "plan must be 'monthly' or 'yearly'" }, { status: 400 });
    }

    const nonce = crypto.randomBytes(24).toString("hex");

    try {
      await kv.set(`pdftools:checkout:${nonce}`, JSON.stringify({ clientId, plan, used: false }), { ex: 7200 });
    } catch {
      // KV not available — return nonce anyway, confirm will fail gracefully
    }

    return NextResponse.json({ ok: true, nonce });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to initialize checkout" }, { status: 500 });
  }
}
