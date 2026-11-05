import { getPublicListings, rentLlmsTxt } from "@/app/rent/_seo/rentSeo";

// https://rent.gigfine.com/llms.txt — a brief for AI assistants (llmstxt.org) with today's listings.
// Rent site only for now; per request because the same build serves every domain (APP_MODE).
// The listings fetch itself is cached for 10 minutes (rentSeo.ts).
export const dynamic = "force-dynamic";

export async function GET() {
  const mode = process.env.APP_MODE;
  // `next dev` without APP_MODE serves everything from one server
  if (mode !== "rental" && !(process.env.NODE_ENV === "development" && !mode)) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(rentLlmsTxt(await getPublicListings()), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
