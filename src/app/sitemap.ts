import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL } from "./seo";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/register": 0.9,
  "/contact-us": 0.6,
  "/contact-for-business": 0.6,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    // "&" in "/terms-&-conditions" must be escaped in a URL
    url: `${SITE_URL}${encodeURI(route).replace(/&/g, "%26")}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: PRIORITY[route] ?? 0.3,
  }));
}
