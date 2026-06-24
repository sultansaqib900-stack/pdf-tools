import { NextResponse } from "next/server";

// Direct checkout URLs are used from the client side.
// This API route is reserved for future dynamic checkout generation.
export async function POST() {
  return NextResponse.json({ url: null });
}
