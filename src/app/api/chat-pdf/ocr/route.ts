import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPremiumStatus, getPremiumStatusByEmail, consumeChatCredit, CHAT_DAILY_LIMIT } from "@/lib/kv";

const MAX_PAGES_PER_REQUEST = 20;

export async function POST(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 10,
    window: 60,
    scope: "ai:ocr",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Gemini API key not configured." }, { status: 500 });
  }

  try {
    const { pages, fileName, clientId, email } = await req.json();
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ ok: false, error: "No page images provided." }, { status: 400 });
    }

    // AI OCR is the most expensive call on the site — up to 20 page images per
    // request against our Gemini billing — and previously had no entitlement
    // check at all, only a rate limit. Charge it against the same daily quota
    // as chat, enforced here rather than by the client.
    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing client identifier." }, { status: 400 });
    }

    let premium = await getPremiumStatus(clientId);
    if (!premium && typeof email === "string" && email) {
      premium = await getPremiumStatusByEmail(email);
    }

    if (!premium) {
      const { allowed, degraded } = await consumeChatCredit(clientId);
      if (degraded) {
        return NextResponse.json(
          { ok: false, error: "AI is briefly unavailable. Please try again shortly." },
          { status: 503 }
        );
      }
      if (!allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: `You have used all ${CHAT_DAILY_LIMIT} free AI operations today. Upgrade to Premium for unlimited use.`,
            limitReached: true,
          },
          { status: 429 }
        );
      }
    }
    if (pages.length > MAX_PAGES_PER_REQUEST) {
      return NextResponse.json(
        { ok: false, error: `Too many pages in one request (max ${MAX_PAGES_PER_REQUEST}).` },
        { status: 413 }
      );
    }

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = pages.map((p: string) => ({
      inlineData: { mimeType: "image/jpeg", data: p },
    }));

    parts.push({ text: `Extract ALL text from the PDF "${fileName}" shown in these page images. Return the complete text preserving structure, paragraphs, and page breaks.` });

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 8192 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      let detail = `AI API error: ${geminiRes.status}`;
      try { const j = JSON.parse(errText); detail += ` — ${j.error?.message || errText}`; } catch { detail += ` — ${errText}`; }
      return NextResponse.json({ ok: false, error: detail }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return NextResponse.json({ ok: false, error: "OCR could not read text from these pages." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "OCR processing failed." }, { status: 500 });
  }
}
