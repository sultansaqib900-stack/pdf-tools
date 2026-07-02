import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const badge = (text: string, color = "rgba(255,255,255,0.1)") => (
  <span
    style={{
      padding: "6px 16px",
      borderRadius: 999,
      background: color,
      border: "1px solid rgba(255,255,255,0.15)",
      fontSize: 16,
      color: "rgba(255,255,255,0.85)",
      fontWeight: 500,
    }}
  >
    {text}
  </span>
);

export default function OpenGraphImage() {
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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(79,70,229,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.1)",
          }}
        />
        <h1
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          PDFTools
        </h1>
        <p
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.6)",
            margin: "8px 0 0 0",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          29 Free PDF Tools &bull; AI Chat with PDF &bull; 100% Private — No Uploads
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 28,
            maxWidth: 800,
            justifyContent: "center",
          }}
        >
          {badge("Compress")}
          {badge("Merge")}
          {badge("Split")}
          {badge("Image to PDF")}
          {badge("PDF to Images")}
          {badge("Extract Text")}
          {badge("Sign PDF")}
          {badge("Protect PDF")}
          {badge("Unlock PDF")}
          {badge("Watermark")}
          {badge("Rotate")}
          {badge("Crop")}
          {badge("Resize")}
          {badge("Organize")}
          {badge("Delete Pages")}
          {badge("Fill Forms")}
          {badge("Flatten")}
          {badge("Reverse")}
          {badge("Metadata")}
          {badge("Text to PDF")}
          {badge("HTML to PDF")}
          {badge("Batch")}
          {badge("Talk to PDF", "rgba(16,185,129,0.2)")}
          {badge("AI OCR", "rgba(16,185,129,0.2)")}
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 28,
            fontSize: 16,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>✓ No Signup</span>
          <span>✓ No Uploads</span>
          <span>✓ Browser-Based</span>
          <span>✓ Free Daily Use</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
