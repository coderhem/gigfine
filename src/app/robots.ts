import type { MetadataRoute } from "next";
import { RENT_SITE_URL, SITE_URL } from "./seo";

// One build serves gigfine.com and rent.gigfine.com (APP_MODE, see src/proxy.ts), so this is
// built per request from the runtime APP_MODE instead of once at build time.
export const dynamic = "force-dynamic";

// AI assistants' crawlers, named so they are clearly welcome (a named group replaces "*" for
// that bot, so each gets the same rules): ChatGPT, Claude, Perplexity, Gemini, Copilot / Bing,
// Apple Intelligence, Meta AI, Amazon, DuckDuckGo, Common Crawl (used to train many models)
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Bingbot", "Applebot", "Applebot-Extended",
  "meta-externalagent", "Amazonbot", "DuckAssistBot", "CCBot",
];

function rentRobots(): MetadataRoute.Robots {
  const rules = {
    allow: ["/rent", "/llms.txt"],
    disallow: ["/rent/login", "/rent/register", "/rent/landlord", "/rent/contact"],
  };
  return {
    rules: [{ userAgent: "*", ...rules }, { userAgent: AI_BOTS, ...rules }],
    sitemap: `${RENT_SITE_URL}/sitemap.xml`,
    host: RENT_SITE_URL,
  };
}

export default function robots(): MetadataRoute.Robots {
  if (process.env.APP_MODE === "rental") return rentRobots();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Logged-in and admin areas have nothing useful for search engines
      disallow: ["/home", "/client/", "/admin/", "/notifications", "/passenger-login", "/rent"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
