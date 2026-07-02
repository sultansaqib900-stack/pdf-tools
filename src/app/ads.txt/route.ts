export const runtime = "edge";

export async function GET() {
  return new Response(
    "google.com, pub-6315496314477761, DIRECT, f08c47fec0942fa0",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
