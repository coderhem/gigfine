import type { Metadata } from "next";
import { RENT_SITE_NAME, RENT_SITE_URL } from "@/app/seo";

// rent.gigfine.com: canonical / Open Graph URLs resolve against the rent domain, not gigfine.com.
// Only /rent (page.tsx) is indexed for now — login, register and the landlord pages stay out
// of search results, but crawlers may still follow their links.
export const metadata: Metadata = {
  metadataBase: new URL(RENT_SITE_URL),
  title: {
    default: "Rooms & Flats for Rent",
    template: `%s | ${RENT_SITE_NAME}`,
  },
  robots: { index: false, follow: true },
  openGraph: { siteName: RENT_SITE_NAME, locale: "en_US" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
