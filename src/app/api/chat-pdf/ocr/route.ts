import { NextRequest, NextResponse } from "next/server";
import { reserveAiAllowance, resolveRequestEntitlement } from "@/lib/premiumServer";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const requestLimit = await rateLimit(req, { limit: 10, window: 60, identifier: "chat-ocr", failClosed: true });
  if (!requestLimit.success) return rateLimitResponse(requestLimit.reset);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "AI OCR is temporarily unavailable." }, { status: 503 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body.pages) || body.pages.length === 0 || body.pages.length > 25) {
      return NextResponse.json({ ok: false, error: "Provide between 1 and 25 page images." }, { status: 400 });
    }
    const pages = body.pages.map((page: unknown) => validateString(page, 5_000_000));
    if (pages.some((page: string | null) => !page)) {
      return NextResponse.json({ ok: false, error: "One or more page images are invalid or too large." }, { status: 413 });
    }

    const validPages = pages as string[];
    if (
      validPages.reduce((total, page) => total + page.length, 0) > 30_000_000
      || validPages.some((page) => !/^[A-Za-z0-9+/]+={0,2}$/.test(page))
    ) {
      return NextResponse.json({ ok: false, error: "The page-image payload is invalid or too large." }, { status: 413 });
    }

    const entitlement = await resolveRequestEntitlement(req, body.clientId);
    if (!entitlement) {
      return NextResponse.json({ ok: false, error: "A valid client ID is required." }, { status: 400 });
    }
    const pageLimit = entitlement.premium ? 25 : 3;
    if (validPages.length > pageLimit) {
      return NextResponse.json({ ok: false, error: `Free AI OCR supports up to ${pageLimit} pages. Premium supports up to 25 pages.` }, { status: 403 });
    }

    const usage = await reserveAiAllowance(req, entitlement, "ocr");
    if (!usage.ok) {
      if (usage.storageError) {
        return NextResponse.json({ ok: false, error: "AI OCR is temporarily unavailable. Please try again in a moment." }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "Your free AI OCR preview for today is used. Premium includes unlimited AI OCR.", remaining: 0 }, { status: 429 });
    }

    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = validPages.map((page) => ({
      inlineData: { mimeType: "image/jpeg", data: page },
    }));
    const fileName = validateString(body.fileName || "document.pdf", 200) || "document.pdf";
    parts.push({ text: `Extract all readable text from the PDF "${fileName}" shown in these page images. Preserve paragraphs and mark page breaks.` });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 8192 },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `AI OCR provider returned ${response.status}.`, remaining: usage.remaining }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ ok: false, error: "AI OCR could not read text from these pages.", remaining: usage.remaining }, { status: 422 });
    }

    return NextResponse.json({ ok: true, text, remaining: usage.remaining, premium: entitlement.premium });
  } catch {
    return NextResponse.json({ ok: false, error: "AI OCR processing failed." }, { status: 400 });
  }
}
