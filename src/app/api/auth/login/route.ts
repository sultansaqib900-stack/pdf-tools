import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  passwordHashNeedsUpgrade,
  verifyPassword,
} from "@/lib/auth/crypto";
import {
  createSession,
  getUserByEmail,
  updateUserPassword,
} from "@/lib/auth/sessions";
import { grantConfiguredPremium } from "@/lib/kv";
import { getPremiumStatusByUserId } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";

const DUMMY_CREDENTIAL = hashPassword("not-a-real-user-password");

export async function POST(request: NextRequest) {
  const attemptLimit = await rateLimit(request, {
    limit: 10,
    window: 15 * 60,
    identifier: "auth-login",
    failClosed: true,
  });
  if (!attemptLimit.success) return rateLimitResponse(attemptLimit.reset, attemptLimit.limit);

  try {
    const body = await request.json();
    const email = validateEmail(body.email)?.toLowerCase();
    const password = typeof body.password === "string" && body.password.length <= 128
      ? body.password
      : null;
    if (!email || !password) {
      return NextResponse.json({ error: "A valid email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    const passwordValid = user
      ? verifyPassword(password, user.hash, user.salt)
      : verifyPassword(password, DUMMY_CREDENTIAL.hash, DUMMY_CREDENTIAL.salt);
    if (!user || !passwordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (passwordHashNeedsUpgrade(user.hash)) {
      const upgraded = hashPassword(password);
      await updateUserPassword(user.email, upgraded.hash, upgraded.salt);
    }

    const token = await createSession(user);
    const configuredGrant = await grantConfiguredPremium(user.id, user.email);
    const premium = configuredGrant || await getPremiumStatusByUserId(user.id);
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
