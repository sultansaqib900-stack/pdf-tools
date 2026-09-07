import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

export async function POST(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 5,
    window: 3600,
    scope: "subscribe",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    if (BUTTONDOWN_API_KEY) {
      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, tags: ["pdftools-website"] }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Buttondown error:", err);
        return NextResponse.json({ ok: false, error: "Failed to subscribe" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
