import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, RENT_PUBLIC_ROUTES, RENT_SITE_URL, SITE_URL } from "./seo";

// Per request: the same build serves gigfine.com and rent.gigfine.com (APP_MODE)
export const dynamic = "force-dynamic";

const PRIORITY: Record<string, number> = {
  "/": 1,
  "/rent": 1,
  "/register": 0.9,
  "/contact-us": 0.6,
  "/contact-for-business": 0.6,
};

// "&" in "/terms-&-conditions" must be escaped in a URL
const encode = (route: string) => encodeURI(route).replace(/&/g, "%26");

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.APP_MODE === "rental") {
    return [
      // New rooms appear daily
      ...RENT_PUBLIC_ROUTES.map((route) => ({
        url: `${RENT_SITE_URL}${route}`,
        changeFrequency: "daily" as const,
        priority: PRIORITY[route] ?? 0.5,
      })),
      ...["/privacy-policy", "/terms-&-conditions"].map((route) => ({
        url: `${RENT_SITE_URL}${encode(route)}`,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      })),
    ];
  }
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${encode(route)}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: PRIORITY[route] ?? 0.3,
  }));
}
