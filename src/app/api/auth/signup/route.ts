import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto";
import { createSession, createUser } from "@/lib/auth/sessions";
import { grantConfiguredPremium } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail, validateString } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const attemptLimit = await rateLimit(request, {
    limit: 5,
    window: 60 * 60,
    identifier: "auth-signup",
    failClosed: true,
  });
  if (!attemptLimit.success) return rateLimitResponse(attemptLimit.reset, attemptLimit.limit);

  try {
    const body = await request.json();
    const email = validateEmail(body.email)?.toLowerCase();
    const password = typeof body.password === "string" && body.password.length <= 128
      ? body.password
      : null;
    const name = validateString(body.name, 80) || undefined;
    if (!email || !password) {
      return NextResponse.json({ error: "A valid email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password);
    const user = await createUser(email, hash, salt, name);
    if (!user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const token = await createSession(user);
    const premium = await grantConfiguredPremium(user.id, user.email);
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium }, 
    });
    response.cookies.set("pdftools_session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
