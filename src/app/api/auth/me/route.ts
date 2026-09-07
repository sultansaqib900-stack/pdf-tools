import { NextResponse } from "next/server";
import { getSession, getUserByEmail } from "@/lib/auth/sessions";
import { getPremiumStatusByEmail, setPremiumByEmail, setUserPremiumFlag } from "@/lib/kv";

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
    // Reconcile the stored user record against the authoritative entitlement
    // in BOTH directions. Previously this only ever upgraded, so a user record
    // written before a refund kept `premium: true` permanently even after the
    // webhook had revoked the email.
    const emailPremium = await getPremiumStatusByEmail(user.email);
    if (emailPremium && !user.premium) {
      user.premium = true;
      await setPremiumByEmail(user.email);
    } else if (!emailPremium && user.premium) {
      user.premium = false;
      await setUserPremiumFlag(user.email, false);
    }
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, premium: user.premium },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
