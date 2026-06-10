import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Goon — AI Landing Page Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0B0F",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#E6E8EE",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          goon
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#8A90A0",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Type a sentence. Get a landing page.
        </div>
      </div>
    ),
    { ...size }
  );
}
