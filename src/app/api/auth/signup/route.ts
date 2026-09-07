import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto";
import { createUser, createSession } from "@/lib/auth/sessions";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

export async function POST(request: NextRequest) {
  const { success, reset, limit } = await rateLimit(request, {
    limit: 5,
    window: 3600,
    scope: "auth:signup",
    failClosed: true,
  });
  if (!success) return rateLimitResponse(reset, limit);

  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const validEmail = validateEmail(email);
    if (!validEmail) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const { hash, salt } = hashPassword(password);
    const user = await createUser(validEmail, hash, salt);
    if (!user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (typeof name === "string" && name.trim()) user.name = name.trim().slice(0, 100);

    const token = await createSession(user);
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, premium: user.premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
