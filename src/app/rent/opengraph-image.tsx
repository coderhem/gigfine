import { ImageResponse } from "next/og";
import { RENT_DISTRICTS } from "@/app/seo";

// Share card for rent.gigfine.com links on Facebook, WhatsApp, Viber, X, etc.
export const alt = "GIGFINE Rent – verified rooms and flats for rent in Kathmandu Valley";
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
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 800 }}>
          <div style={{ display: "flex" }}>
            GIG<span style={{ color: "#fd5340" }}>FINE</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, padding: "6px 18px", borderRadius: 10, background: "#fd5340" }}>
            Rent
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>Flats & rooms you can trust.</div>
          <div style={{ fontSize: 32, marginTop: 24, opacity: 0.85 }}>
            Every house verified by GIGFINE. Search by area or budget and book a visit.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {[...RENT_DISTRICTS, "Kathmandu Valley"].map((d) => (
            <div key={d} style={{ display: "flex", fontSize: 26, padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.14)" }}>
              {d}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
