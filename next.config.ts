import type { NextConfig } from "next";

// Backend that /api/v1/* is proxied to during `next dev`
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "https://api.gigfine.com";
// Same default as API_BASE_URL in src/api/config.js
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.gigfine.com";

const nextConfig: NextConfig = {
  // Minimal self-contained server bundle for the Docker image
  output: "standalone",

  // Room / house photos (see rentalMedia.tsx): resized, served as WebP and cached on disk.
  // The backend marks them cacheable for a year; file names never get reused.
  images: {
    remotePatterns: [new URL(`${API_ORIGIN.replace(/\/$/, "")}/api/v1/rentals/media/**`)],
    qualities: [75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Let `next dev` be opened from other devices on the LAN (phone testing etc.)
  allowedDevOrigins: ["192.168.18.11"],

  // Local dev only: the browser calls same-origin /api/v1/* and Next forwards it
  // to the backend server-side, so there is no CORS preflight to fail.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
