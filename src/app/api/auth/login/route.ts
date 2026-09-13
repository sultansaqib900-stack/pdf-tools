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
    const premium = await getPremiumStatusByUserId(user.id);
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
