const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

// The verification file must reflect the Vercel runtime value, not a value
// baked into the build. It is public by design: IndexNow providers fetch it.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(): Response {
  const key = process.env.INDEXNOW_KEY?.trim();
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (!key || !INDEXNOW_KEY_PATTERN.test(key)) {
    return new Response("Not found\n", { status: 404, headers });
  }

  return new Response(`${key}\n`, { status: 200, headers });
}
