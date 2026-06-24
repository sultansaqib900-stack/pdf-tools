import { NextRequest, NextResponse } from "next/server";
import { getFeedback, submitFeedback } from "@/lib/kv";

export async function GET() {
  const feedback = await getFeedback();
  return NextResponse.json({ feedback });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, text, rating } = body;

    if (!name?.trim() || !text?.trim()) {
      return NextResponse.json({ ok: false, error: "Name and feedback text are required." }, { status: 400 });
    }

    const entry = await submitFeedback({
      name: name.trim(),
      role: body.role?.trim() || "",
      text: text.trim(),
      rating: Math.min(5, Math.max(1, Math.floor(rating || 5))),
    });

    return NextResponse.json({ ok: true, feedback: entry });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to submit feedback." }, { status: 500 });
  }
}
