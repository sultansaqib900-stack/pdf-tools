import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/crypto";
import { getUserByEmail, createSession } from "@/lib/auth/sessions";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.hash, user.salt)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = await createSession(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, premium: user.premium } });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
