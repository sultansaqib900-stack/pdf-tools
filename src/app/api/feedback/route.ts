import { NextRequest, NextResponse } from "next/server";
import { getFeedback, submitFeedback } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateString, validateNumber } from "@/lib/validation";

export async function GET() {
  const feedback = await getFeedback();
  return NextResponse.json({ feedback });
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per hour per IP
  const { success, reset } = await rateLimit(req, { limit: 5, window: 3600, identifier: "feedback" });
  if (!success) {
    return rateLimitResponse(reset);
  }

  try {
    const body = await req.json();
    const name = validateString(body.name, 100);
    const text = validateString(body.text, 1000);
    const role = validateString(body.role, 100);
    const rating = validateNumber(body.rating, 1, 5);

    if (!name || !text) {
      return NextResponse.json({ ok: false, error: "Name and feedback text are required." }, { status: 400 });
    }

    const entry = await submitFeedback({
      name,
      role: role || "",
      text,
      rating: rating || 5,
    });

    return NextResponse.json({ ok: true, feedback: entry });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to submit feedback." }, { status: 500 });
  }
}
