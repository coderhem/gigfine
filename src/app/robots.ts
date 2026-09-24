import type { MetadataRoute } from "next";
import { SITE_URL } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Logged-in and admin areas have nothing useful for search engines
      disallow: ["/home", "/client/", "/admin/", "/notifications", "/passenger-login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
