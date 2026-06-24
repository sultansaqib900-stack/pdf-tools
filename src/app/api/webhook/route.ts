import { NextResponse } from "next/server";
import crypto from "crypto";
import { setPremiumByEmail } from "@/lib/kv";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.meta?.event_name === "order_created") {
      const attrs = event.data?.attributes;
      const email = attrs?.user_email;
      const orderId = attrs?.identifier;
      const status = attrs?.status;

      if (status === "paid" && email) {
        console.log(`Premium purchase: ${email} — ${attrs?.variant_name} (${orderId})`);
        await setPremiumByEmail(email);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
