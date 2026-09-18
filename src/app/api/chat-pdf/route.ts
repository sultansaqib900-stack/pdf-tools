import { NextRequest, NextResponse } from "next/server";
import { consumeAiAllowance } from "@/lib/premiumServer";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString } from "@/lib/validation";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPTS: Record<string, string> = {
  qna: `You are a helpful PDF assistant. Answer the user's question based ONLY on the content of the PDF document below. If the answer is not in the document, say "I couldn't find that in the document." Be concise and accurate.`,
  summarize: `You are a PDF summarizer. Summarize the document below in a clear, structured way. Include: main topics, key points (3-7 bullet points), and a one-sentence bottom line. Write in English. Be concise but thorough.`,
  rewrite: `You are a text simplifier. Rewrite the document below using simpler language. Keep all important information but make it easier to understand. Use short sentences, plain words, and clear structure.`,
  translate: `You are a translator. Translate the document below into Urdu. Keep all facts, numbers, names, and technical terms unchanged. Use natural, fluent Urdu and maintain the original structure.`,
};

export async function POST(req: NextRequest) {
  const requestLimit = await rateLimit(req, { limit: 20, window: 60, identifier: "chat-pdf", failClosed: true });
  if (!requestLimit.success) return rateLimitResponse(requestLimit.reset);

  try {
    const body = await req.json();
    const text = validateString(body.text, 100_000);
    const question = validateString(body.question || "", 5_000) || "";
    const mode = typeof body.mode === "string" && SYSTEM_PROMPTS[body.mode] ? body.mode : "qna";
    if (!text) {
      return NextResponse.json({ ok: false, error: "PDF text is required." }, { status: 400 });
    }
    if (mode === "qna" && !question) {
      return NextResponse.json({ ok: false, error: "A question is required." }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: "AI is temporarily unavailable." }, { status: 503 });
    }

    // Consume the server-side allowance before creating billable AI traffic.
    const allowance = await consumeAiAllowance(req, body.clientId);
    if (!allowance) {
      return NextResponse.json({ ok: false, error: "A valid client ID is required." }, { status: 400 });
    }
    if (!allowance.ok) {
      if (allowance.storageError) {
        // The quota counter store is unreachable: fail closed, but do not
        // claim the user exhausted a quota they may not have.
        return NextResponse.json({ ok: false, error: "AI is temporarily unavailable. Please try again in a moment." }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "Your 3 free AI requests for today are used. Upgrade for unlimited AI.", remaining: 0 }, { status: 429 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];
    const truncatedText = text.slice(0, 80_000);
    const contents: { role: string; parts: { text: string }[] }[] = [];

    if (Array.isArray(body.history)) {
      for (const message of body.history.slice(-10)) {
        const messageText = validateString(message?.text, 5_000);
        if (!messageText) continue;
        contents.push({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: messageText }],
        });
      }
    }

    const instruction = mode === "qna"
      ? `${systemPrompt}\n\nPDF CONTENT:\n${truncatedText}\n\nUser question: ${question}`
      : `${systemPrompt}\n\nPDF CONTENT:\n${truncatedText}`;
    contents.push({ role: "user", parts: [{ text: instruction }] });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: `AI provider returned ${response.status}. Please try again later.`, remaining: allowance.remaining }, { status: 502 });
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ ok: false, error: "The AI provider returned no answer.", remaining: allowance.remaining }, { status: 502 });
    }

    return NextResponse.json({ ok: true, answer, remaining: allowance.remaining, premium: allowance.premium });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to process request." }, { status: 400 });
  }
}
