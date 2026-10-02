import type { NextConfig } from "next";

// Backend that /api/v1/* is proxied to during `next dev`
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "https://api.gigfine.com";

const nextConfig: NextConfig = {
  // Minimal self-contained server bundle for the Docker image
  output: "standalone",

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
