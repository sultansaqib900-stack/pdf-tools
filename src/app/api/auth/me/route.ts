import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/request";
import { getUserByEmail } from "@/lib/auth/sessions";
import { getPremiumStatusByUserId } from "@/lib/kv";

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedSession(request);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const user = await getUserByEmail(session.email);
    if (!user || user.id !== session.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    const premium = await getPremiumStatusByUserId(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
