import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Shared Open Graph image factory (Phase 5): one visual style, per-page title.
 * Used by each route's `opengraph-image.tsx` so every important page gets an OG
 * image that names the tool/post instead of the generic site banner.
 */
export function makeOgImage(title: string, subtitle: string): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0c29 0%, #1e1b4b 40%, #312e81 70%, #4338ca 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(79,70,229,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -100,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(129,140,248,0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
            padding: "10px 26px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "rgba(255,255,255,0.85)",
            fontSize: 22,
            letterSpacing: 2,
            fontWeight: 600,
          }}
        >
          PDFTOOLS
        </div>
        <div
          style={{
            fontSize: title.length > 28 ? 58 : 72,
            fontWeight: 800,
            color: "#ffffff",
            maxWidth: 1000,
            textAlign: "center",
            lineHeight: 1.12,
            padding: "0 60px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 28,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.35,
            padding: "0 60px",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 34,
            fontSize: 20,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: 1,
          }}
        >
          allaboutpdfediting.xyz — files stay in your browser
        </div>
      </div>
    ),
    ogSize,
  );
}
