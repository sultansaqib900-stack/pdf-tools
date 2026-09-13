import { NextRequest, NextResponse } from "next/server";
import { reserveAiAllowance, resolveRequestEntitlement } from "@/lib/premiumServer";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_PAGES = 3;
const MAX_PAGE_BASE64_LENGTH = 5_000_000;
const MAX_PAYLOAD_LENGTH = 15_000_000;

const SYSTEM_PROMPT = "You are a table extraction AI. Extract ALL tables from these document pages. Return ONLY the data in CSV format. Use proper CSV with commas and newlines. If there are multiple tables, separate them with a blank line. Include headers. Preserve all numbers, dates, and text exactly as they appear.";

function validatePageImages(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_PAGES) return null;
  const pages = value.map((page) => validateString(page, MAX_PAGE_BASE64_LENGTH));
  if (pages.some((page) => !page)) return null;

  const validPages = pages as string[];
  if (
    validPages.reduce((total, page) => total + page.length, 0) > MAX_PAYLOAD_LENGTH
    || validPages.some((page) => !page.startsWith("/9j/") || !/^[A-Za-z0-9+/]+={0,2}$/.test(page))
  ) {
    return null;
  }
  return validPages;
}

export async function POST(req: NextRequest) {
  const requestLimit = await rateLimit(req, {
    limit: 10,
    window: 60,
    identifier: "extract-tables",
    failClosed: true,
  });
  if (!requestLimit.success) return rateLimitResponse(requestLimit.reset, requestLimit.limit);

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ ok: false, error: "AI table extraction is temporarily unavailable." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const pages = validatePageImages(body.pages);
    if (!pages) {
      return NextResponse.json(
        { ok: false, error: `Provide between 1 and ${MAX_PAGES} valid JPEG page images.` },
        { status: 413 },
      );
    }

    const entitlement = await resolveRequestEntitlement(req, body.clientId);
    if (!entitlement) {
      return NextResponse.json({ ok: false, error: "A valid client ID is required." }, { status: 400 });
    }

    // Reserve quota before the request can create Gemini cost. Table fallback
    // has its own one-use free preview and does not consume Chat or OCR quota.
    const allowance = await reserveAiAllowance(req, entitlement, "table");
    if (!allowance.ok) {
      return NextResponse.json({
        ok: false,
        error: "Your free AI table-extraction preview for today is used. Premium includes unlimited AI.",
        remaining: 0,
      }, { status: 429 });
    }

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
      { text: SYSTEM_PROMPT },
      ...pages.map((page) => ({ inlineData: { mimeType: "image/jpeg", data: page } })),
    ];
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 8192 },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({
        ok: false,
        error: `AI table-extraction provider returned ${response.status}. Please try again later.`,
        remaining: allowance.remaining,
      }, { status: 502 });
    }

    const data = await response.json();
    const csv = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof csv !== "string" || !csv.trim()) {
      return NextResponse.json({
        ok: false,
        error: "No tables were found in these pages.",
        remaining: allowance.remaining,
      }, { status: 422 });
    }

    return NextResponse.json({
      ok: true,
      csv: csv.trim(),
      remaining: allowance.remaining,
      premium: allowance.premium,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Table extraction failed." }, { status: 400 });
  }
}
