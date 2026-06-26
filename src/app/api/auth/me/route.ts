import { NextResponse } from "next/server";
import { getSession, getUserByEmail } from "@/lib/auth/sessions";

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const token = auth.slice(7);
    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const user = await getUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium: user.premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
