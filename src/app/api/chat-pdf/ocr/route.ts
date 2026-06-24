import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Gemini API key not configured." }, { status: 500 });
  }

  try {
    const { pages, fileName } = await req.json();
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ ok: false, error: "No page images provided." }, { status: 400 });
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
