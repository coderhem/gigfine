import { ImageResponse } from "next/og";
import { RIDE_SHARING_APPS } from "./seo";

// Share card for Facebook, WhatsApp, Viber, X, etc.
export const alt =
  "GIGFINE – Report ride-sharing problems in Nepal for passengers and riders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0c589c 0%, #083d6d 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
          GIG<span style={{ color: "#fd5340" }}>FINE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
            Report ride-sharing problems in Nepal.
          </div>
          <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85 }}>
            For passengers and riders — incidents, safety, payments. Get them
            resolved.
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {RIDE_SHARING_APPS.map((app) => (
            <div
              key={app}
              style={{
                display: "flex",
                fontSize: 26,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
              }}
            >
              {app}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
