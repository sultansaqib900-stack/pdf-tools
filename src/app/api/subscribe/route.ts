import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

export async function POST(req: NextRequest) {
  const requestLimit = await rateLimit(req, {
    limit: 5,
    window: 60 * 60,
    identifier: "newsletter-subscribe",
    failClosed: true,
  });
  if (!requestLimit.success) return rateLimitResponse(requestLimit.reset, requestLimit.limit);

  if (!BUTTONDOWN_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Newsletter signup is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const email = validateEmail(body.email)?.toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const response = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Token ${BUTTONDOWN_API_KEY}`,
        "Content-Type": "application/json",
        "X-Buttondown-Collision-Behavior": "add",
      },
      body: JSON.stringify({ email_address: email, tags: ["pdftools-website"] }),
    });

    if (!response.ok) {
      console.error("Buttondown subscription failed with status", response.status);
      return NextResponse.json({ ok: false, error: "Failed to subscribe" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Newsletter signup failed." }, { status: 400 });
  }
}
