import { NextRequest, NextResponse } from "next/server";
import { getPremiumStatus, getPremiumStatusByEmail } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const email = req.nextUrl.searchParams.get("email");

  if (email) {
    const emailPremium = await getPremiumStatusByEmail(email);
    if (emailPremium) return NextResponse.json({ premium: true });
  }

  if (!clientId) {
    return NextResponse.json({ premium: false });
  }

  const premium = await getPremiumStatus(clientId);
  return NextResponse.json({ premium });
}
