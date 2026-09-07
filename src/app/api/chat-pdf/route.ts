import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getPremiumStatus, getPremiumStatusByEmail, consumeChatCredit, CHAT_DAILY_LIMIT } from "@/lib/kv";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPTS: Record<string, string> = {
  qna: `You are a helpful PDF assistant. Answer the user's question based ONLY on the content of the PDF document below. If the answer is not in the document, say "I couldn't find that in the document." Be concise and accurate.`,
  summarize: `You are a PDF summarizer. Summarize the document below in a clear, structured way. Include: main topics, key points (3-7 bullet points), and a one-sentence bottom line. Write in English. Be concise but thorough.`,
  rewrite: `You are a text simplifier. Rewrite the document below using simpler language. Keep all the important information but make it easier to understand. Use short sentences, plain words, and clear structure.`,
  translate: `You are a translator. Translate the document below into Urdu (اردو). Keep all facts, numbers, names, and technical terms unchanged. Use natural, fluent Urdu. Maintain the original structure and meaning.`,
};

export async function POST(req: NextRequest) {
  // Gemini-backed and unauthenticated: fail closed so a KV outage cannot turn
  // this into an open proxy against our billing account.
  const { success, reset, limit } = await rateLimit(req, {
    limit: 15,
    window: 60,
    scope: "ai:chat",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  let remainingAfterCall: number | undefined;

  try {
    const { text, question, history, mode = "qna", clientId, email } = await req.json();

    if (!text) {
      return NextResponse.json({ ok: false, error: "PDF text is required." }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ ok: false, error: "AI not configured. Admin needs to set GEMINI_API_KEY." }, { status: 503 });
    }

    // --- Entitlement / quota -------------------------------------------------
    //
    // Every call here costs real money against our Gemini account, so the free
    // daily quota is enforced HERE rather than trusted from the client. The
    // page used to increment a counter after the fact via /api/chat-pdf/track,
    // which anyone could skip by calling this endpoint directly.
    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing client identifier." }, { status: 400 });
    }

    let premium = await getPremiumStatus(clientId);
    if (!premium && typeof email === "string" && email) {
      premium = await getPremiumStatusByEmail(email);
    }

    if (!premium) {
      const { allowed, remaining, degraded } = await consumeChatCredit(clientId);
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
            error: `You have used all ${CHAT_DAILY_LIMIT} free AI questions today. Upgrade to Premium for unlimited questions.`,
            remaining: 0,
            limitReached: true,
          },
          { status: 429 }
        );
      }
      // Surface the post-consumption balance so the UI need not guess.
      remainingAfterCall = remaining;
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.qna;
    const truncatedText = text.slice(0, 80000);
    const needsQuestion = mode === "qna";

    const contents: { role: string; parts: { text: string }[] }[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        const role = msg.role === "assistant" ? "model" : msg.role;
        contents.push({ role, parts: [{ text: msg.text }] });
      }
    }

    if (needsQuestion && question) {
      contents.push({ role: "user", parts: [{ text: `${systemPrompt}\n\nPDF CONTENT:\n${truncatedText}\n\nUser question: ${question}` }] });
    } else {
      contents.push({ role: "user", parts: [{ text: `${systemPrompt}\n\nPDF CONTENT:\n${truncatedText}${mode === "translate" ? "\n\nTranslate this entire document to Urdu (اردو)." : ""}${mode === "summarize" ? "\n\nProvide a clear summary of this document." : ""}${mode === "rewrite" ? "\n\nRewrite this using simpler language." : ""}` }] });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      let detail = `AI API error: ${res.status}`;
      try { const j = JSON.parse(errText); detail += ` — ${j.error?.message || errText}`; } catch { detail += ` — ${errText}`; }
      return NextResponse.json({ ok: false, error: detail }, { status: 502 });
    }

    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    return NextResponse.json({ ok: true, answer, remaining: remainingAfterCall });
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to process request." }, { status: 500 });
  }
}
