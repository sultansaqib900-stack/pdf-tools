import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPremiumStatus, getPremiumStatusByEmail, consumeChatCredit, CHAT_DAILY_LIMIT } from "@/lib/kv";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BATCH_SIZE = 5;

const SYSTEM_PROMPT = "You are a table extraction AI. Extract ALL tables from these document pages. Return ONLY the data in CSV format. Use proper CSV with commas and newlines. If there are multiple tables, separate them with a blank line. Include headers. Preserve all numbers, dates, and text exactly as they appear.";

async function extractTablesFromPages(pages: string[]): Promise<string> {
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = pages.map((p) => ({
    inlineData: { mimeType: "image/jpeg", data: p },
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: SYSTEM_PROMPT }, ...parts] }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    let detail = `AI API error: ${res.status}`;
    try { const j = JSON.parse(errText); detail += ` — ${j.error?.message || errText}`; } catch { detail += ` — ${errText}`; }
    throw new Error(detail);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  const { success, reset, limit } = await rateLimit(req, {
    limit: 10,
    window: 60,
    scope: "ai:tables",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ ok: false, error: "Gemini API key not configured." }, { status: 500 });
  }

  try {
    const { pages, clientId, email } = await req.json();
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ ok: false, error: "No page images provided." }, { status: 400 });
    }

    // Gemini-backed and billed per page image, looped in batches — enforce the
    // same free daily quota server-side rather than trusting the caller.
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

    const csvParts: string[] = [];
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const batch = pages.slice(i, i + BATCH_SIZE);
      const csv = await extractTablesFromPages(batch);
      if (csv.trim()) csvParts.push(csv.trim());
    }

    const csv = csvParts.join("\n\n");
    if (!csv) {
      return NextResponse.json({ ok: false, error: "No tables found in the document." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, csv });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Table extraction failed.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
