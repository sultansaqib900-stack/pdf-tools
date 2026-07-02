import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@vercel/kv";
import { setPremiumStatus } from "@/lib/kv";
import { setPremiumByEmail } from "@/lib/kv";

const kv = createClient({
  url: process.env.pdf_tools_KV_REST_API_URL || process.env.KV_REST_API_URL || "",
  token: process.env.pdf_tools_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const { clientId, nonce, email } = await req.json();
    if (!clientId) {
      return NextResponse.json({ ok: false, error: "No clientId" }, { status: 400 });
    }

    if (nonce) {
      try {
        const raw = await kv.get(`pdftools:checkout:${nonce}`);
        if (raw) {
          const data = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (data.used) {
            return NextResponse.json({ ok: false, error: "Nonce already used" }, { status: 400 });
          }
          if (data.clientId !== clientId) {
            return NextResponse.json({ ok: false, error: "Nonce mismatch" }, { status: 400 });
          }
          await kv.set(`pdftools:checkout:${nonce}`, JSON.stringify({ ...data, used: true }), { ex: 7200 });
        }
      } catch {
        // KV unavailable — proceed anyway
      }
    }

    await setPremiumStatus(clientId, true);

    if (email) {
      await setPremiumByEmail(email, clientId);
    }

    return NextResponse.json({ ok: true, premium: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
