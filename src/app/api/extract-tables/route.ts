import { NextRequest, NextResponse } from "next/server";

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
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ ok: false, error: "Gemini API key not configured." }, { status: 500 });
  }

  try {
    const { pages } = await req.json();
    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ ok: false, error: "No page images provided." }, { status: 400 });
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
