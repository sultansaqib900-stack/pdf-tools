import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/crypto";
import { createUser, createSession } from "@/lib/auth/sessions";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const { hash, salt } = hashPassword(password);
    const user = await createUser(email, hash, salt);
    if (!user) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    if (name) user.name = name;
    const token = await createSession(user);
    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, premium: user.premium } });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
