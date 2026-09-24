import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "./seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – Ride-Sharing Problem Reporting`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0c589c",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
