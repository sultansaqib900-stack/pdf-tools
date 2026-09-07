import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, isLegacyHash } from "@/lib/auth/crypto";
import { getUserByEmail, createSession, upgradePasswordHash } from "@/lib/auth/sessions";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Two layers: a per-IP burst limit and a per-account limit, so an attacker
  // cannot spread a credential-stuffing run for one account across many IPs.
  const ipLimit = await rateLimit(request, {
    limit: 10,
    window: 300,
    scope: "auth:login:ip",
    failClosed: true,
  });
  if (!ipLimit.success) return rateLimitResponse(ipLimit.reset, ipLimit.limit);

  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const validEmail = validateEmail(email);
    if (!validEmail) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const accountLimit = await rateLimit(request, {
      limit: 8,
      window: 900,
      scope: "auth:login:account",
      identifier: validEmail,
      failClosed: true,
    });
    if (!accountLimit.success) return rateLimitResponse(accountLimit.reset, accountLimit.limit);

    const user = await getUserByEmail(validEmail);
    if (!user || !verifyPassword(password, user.hash, user.salt)) {
      // Identical message + status for both cases: no account enumeration.
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Silently migrate legacy SHA-256 hashes to scrypt on successful login.
    if (isLegacyHash(user.hash)) {
      await upgradePasswordHash(validEmail, password);
    }

    const token = await createSession(user);
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, premium: user.premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
